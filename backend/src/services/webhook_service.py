"""
Webhook delivery service for StellarInsure API.
Handles webhook event dispatching with retry logic and HMAC signature verification.
"""
import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Any, Dict, List

import httpx
from sqlalchemy.orm import Session

from ..config import get_settings
from ..models import Webhook, WebhookDelivery

logger = logging.getLogger(__name__)

settings = get_settings()


def _generate_signature(payload: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature for webhook payload."""
    return hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _deliver_single(webhook: Webhook, event_type: str, payload_str: str, db: Session) -> WebhookDelivery:
    """Attempt to deliver a webhook event with retries."""
    delivery = WebhookDelivery(
        webhook_id=webhook.id,
        event_type=event_type,
        payload=payload_str,
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
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(webhook.url, content=payload_str, headers=headers)
            delivery.response_status = response.status_code
            delivery.response_body = response.text[:2000]  # limit stored body size
            if 200 <= response.status_code < 300:
                delivery.success = True
                db.commit()
                logger.info(
                    "Webhook delivered: id=%s event=%s url=%s attempt=%d",
                    delivery.id, event_type, webhook.url, attempt,
                )
                return delivery
            logger.warning(
                "Webhook delivery failed: id=%s status=%d attempt=%d/%d",
                delivery.id, response.status_code, attempt, max_retries,
            )
        except Exception as e:
            delivery.response_body = str(e)[:2000]
            logger.warning(
                "Webhook delivery error: id=%s attempt=%d/%d error=%s",
                delivery.id, attempt, max_retries, e,
            )
        db.commit()

    logger.error(
        "Webhook delivery exhausted retries: id=%s event=%s url=%s",
        delivery.id, event_type, webhook.url,
    )
    return delivery


def dispatch_webhook_event(
    db: Session,
    user_id: int,
    event_type: str,
    payload: Dict[str, Any],
) -> List[WebhookDelivery]:
    """
    Dispatch a webhook event to all active webhooks for a user that subscribe to the event type.

    Args:
        db: Database session
        user_id: User who owns the webhooks
        event_type: The event type (e.g. 'policy.created')
        payload: Event payload data

    Returns:
        List of WebhookDelivery records
    """
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
    """Verify an incoming webhook signature for authenticity."""
    expected_sig = f"sha256={_generate_signature(payload, secret)}"
    return hmac.compare_digest(expected_sig, signature)
