"""Webhook management endpoints for StellarInsure API."""
import secrets
from typing import List

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_active_user
from ..errors import StellarInsureError
from ..models import User, Webhook, WebhookDelivery
from ..schemas import (
    WebhookCreateRequest,
    WebhookUpdateRequest,
    WebhookResponse,
    WebhookDeliveryResponse,
    MessageResponse,
)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class WebhookNotFoundError(StellarInsureError):
    def __init__(self, detail: str = "Webhook not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, "WEBHOOK_001")


def _format_webhook(webhook: Webhook) -> WebhookResponse:
    return WebhookResponse(
        id=webhook.id,
        url=webhook.url,
        event_types=webhook.get_event_types(),
        is_active=webhook.is_active,
        created_at=webhook.created_at,
        updated_at=webhook.updated_at,
    )


@router.post(
    "/",
    response_model=WebhookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a webhook",
    description="Registers a new webhook endpoint to receive event notifications. A secret is generated for payload signature verification.",
    responses={
        201: {"description": "Webhook registered successfully"},
        401: {"description": "Not authenticated"},
        422: {"description": "Invalid event types or URL"},
    },
)
async def create_webhook(
    body: WebhookCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    webhook = Webhook(
        user_id=current_user.id,
        url=body.url,
        secret=secrets.token_hex(32),
        event_types=",".join(body.event_types),
        is_active=True,
    )
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    return _format_webhook(webhook)


@router.get(
    "/",
    response_model=List[WebhookResponse],
    summary="List webhooks",
    description="Returns all webhooks registered by the authenticated user.",
    responses={
        200: {"description": "List of webhooks"},
        401: {"description": "Not authenticated"},
    },
)
async def list_webhooks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    webhooks = (
        db.query(Webhook)
        .filter(Webhook.user_id == current_user.id)
        .order_by(Webhook.created_at.desc())
        .all()
    )
    return [_format_webhook(w) for w in webhooks]


@router.get(
    "/{webhook_id}",
    response_model=WebhookResponse,
    summary="Get webhook details",
    description="Returns details of a specific webhook, including its subscribed event types.",
    responses={
        200: {"description": "Webhook details"},
        404: {"description": "Webhook not found"},
        401: {"description": "Not authenticated"},
    },
)
async def get_webhook(
    webhook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )
    if webhook is None:
        raise WebhookNotFoundError()
    return _format_webhook(webhook)


@router.patch(
    "/{webhook_id}",
    response_model=WebhookResponse,
    summary="Update a webhook",
    description="Updates a webhook's URL, event subscriptions, or active status.",
    responses={
        200: {"description": "Webhook updated"},
        404: {"description": "Webhook not found"},
        401: {"description": "Not authenticated"},
    },
)
async def update_webhook(
    webhook_id: int,
    body: WebhookUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )
    if webhook is None:
        raise WebhookNotFoundError()

    if body.url is not None:
        webhook.url = body.url
    if body.event_types is not None:
        webhook.event_types = ",".join(body.event_types)
    if body.is_active is not None:
        webhook.is_active = body.is_active

    db.commit()
    db.refresh(webhook)
    return _format_webhook(webhook)


@router.delete(
    "/{webhook_id}",
    response_model=MessageResponse,
    summary="Delete a webhook",
    description="Permanently removes a webhook and all its delivery history.",
    responses={
        200: {"description": "Webhook deleted"},
        404: {"description": "Webhook not found"},
        401: {"description": "Not authenticated"},
    },
)
async def delete_webhook(
    webhook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )
    if webhook is None:
        raise WebhookNotFoundError()

    db.delete(webhook)
    db.commit()
    return MessageResponse(message="Webhook deleted successfully")


@router.get(
    "/{webhook_id}/deliveries",
    response_model=List[WebhookDeliveryResponse],
    summary="List webhook deliveries",
    description="Returns the delivery history for a specific webhook, ordered by most recent first.",
    responses={
        200: {"description": "List of deliveries"},
        404: {"description": "Webhook not found"},
        401: {"description": "Not authenticated"},
    },
)
async def list_webhook_deliveries(
    webhook_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )
    if webhook is None:
        raise WebhookNotFoundError()

    offset = (page - 1) * per_page
    deliveries = (
        db.query(WebhookDelivery)
        .filter(WebhookDelivery.webhook_id == webhook_id)
        .order_by(WebhookDelivery.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return [
        WebhookDeliveryResponse(
            id=d.id,
            webhook_id=d.webhook_id,
            event_type=d.event_type,
            response_status=d.response_status,
            success=d.success,
            attempts=d.attempts,
            created_at=d.created_at,
        )
        for d in deliveries
    ]
