"""
Webhook delivery service for StellarInsure API.
Handles webhook event dispatching with retry logic and HMAC signature verification.
"""
import hashlib
import hmac
import json
import logging
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy.orm import Session

from ..config import get_settings
from ..models import Webhook, WebhookDelivery

logger = logging.getLogger(__name__)

settings = get_settings()

DELIVERY_STATUS_PENDING = "pending"
DELIVERY_STATUS_DELIVERED = "delivered"
DELIVERY_STATUS_FAILED = "failed"
DELIVERY_STATUS_DEAD_LETTER = "dead_letter"


def _generate_signature(payload: str, secret: str) -> str:
    return hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def classify_delivery_failure(
    response_status: Optional[int] = None,
    error: Optional[Exception] = None,
) -> str:
    if response_status is not None:
        if 200 <= response_status < 300:
            return DELIVERY_STATUS_DELIVERED
        if response_status in {408, 429} or response_status >= 500:
            return DELIVERY_STATUS_FAILED
        if 400 <= response_status < 500:
            return DELIVERY_STATUS_DEAD_LETTER

    if error is not None:
        return DELIVERY_STATUS_FAILED

    return DELIVERY_STATUS_FAILED


def _mark_delivery_state(
    delivery: WebhookDelivery,
    *,
    success: bool,
    delivery_status: str,
) -> None:
    delivery.success = success
    delivery.delivery_status = delivery_status


def _deliver_single(
    webhook: Webhook,
    event_type: str,
    payload_str: str,
    db: Session,
    _sleep=time.sleep,
) -> WebhookDelivery:
    delivery = WebhookDelivery(
        webhook_id=webhook.id,
        event_type=event_type,
        payload=payload_str,
        delivery_status=DELIVERY_STATUS_PENDING,
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    signature = _generate_signature(payload_str, webhook.secret)
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Signature": f"sha256={signature}",
        "X-Webhook-Event": event_type,
        "X-Webhook-Delivery-Id": str(delivery.id),
        "User-Agent": "StellarInsure-Webhook/1.0",
    }

    max_retries = settings.webhook_max_retries
    timeout = settings.webhook_delivery_timeout

    for attempt in range(1, max_retries + 1):
        delivery.attempts = attempt
        delivery.last_attempt_at = datetime.utcnow()
        response_status: Optional[int] = None
        caught_error: Optional[Exception] = None

        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(webhook.url, content=payload_str, headers=headers)
            response_status = response.status_code
            delivery.response_status = response_status
            delivery.response_body = response.text[:2000]
        except Exception as exc:
            caught_error = exc
            delivery.response_body = str(exc)[:2000]

        failure_class = classify_delivery_failure(response_status, caught_error)

        if failure_class == DELIVERY_STATUS_DELIVERED:
            _mark_delivery_state(
                delivery,
                success=True,
                delivery_status=DELIVERY_STATUS_DELIVERED,
            )
            db.commit()
            logger.info(
                "Webhook delivered: id=%s event=%s url=%s attempt=%d",
                delivery.id,
                event_type,
                webhook.url,
                attempt,
            )
            return delivery

        if failure_class == DELIVERY_STATUS_DEAD_LETTER:
            _mark_delivery_state(
                delivery,
                success=False,
                delivery_status=DELIVERY_STATUS_DEAD_LETTER,
            )
            db.commit()
            logger.error(
                "Webhook delivery moved to dead letter: id=%s event=%s url=%s status=%s",
                delivery.id,
                event_type,
                webhook.url,
                response_status,
            )
            return delivery

        logger.warning(
            "Webhook delivery failed: id=%s status=%s attempt=%d/%d",
            delivery.id,
            response_status,
            attempt,
            max_retries,
        )
        db.commit()

        if attempt < max_retries:
            _sleep(settings.webhook_backoff_base * (2 ** (attempt - 1)))

    _mark_delivery_state(
        delivery,
        success=False,
        delivery_status=DELIVERY_STATUS_DEAD_LETTER,
    )
    db.commit()
    logger.error(
        "Webhook delivery exhausted retries: id=%s event=%s url=%s status=%s",
        delivery.id,
        event_type,
        webhook.url,
        delivery.delivery_status,
    )
    return delivery


def dispatch_webhook_event(
    db: Session,
    user_id: int,
    event_type: str,
    payload: Dict[str, Any],
) -> List[WebhookDelivery]:
    webhooks = (
        db.query(Webhook)
        .filter(Webhook.user_id == user_id, Webhook.is_active == True)
        .all()
    )

    matching = [w for w in webhooks if w.subscribes_to(event_type)]
    if not matching:
        return []

    envelope = {
        "event": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "data": payload,
    }
    payload_str = json.dumps(envelope, default=str)

    deliveries = []
    for webhook in matching:
        delivery = _deliver_single(webhook, event_type, payload_str, db)
        deliveries.append(delivery)

    return deliveries


def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    expected_sig = f"sha256={_generate_signature(payload, secret)}"
    return hmac.compare_digest(expected_sig, signature)
