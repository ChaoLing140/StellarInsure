"""Tests for webhook notifications system (Issue #49)."""
import json
import time
from unittest.mock import patch, MagicMock

import pytest

from src.models import Webhook, WebhookDelivery, WebhookEventType


class TestWebhookModel:
    """Test Webhook and WebhookDelivery models."""

    def test_webhook_creation(self, db_session, auth_user):
        webhook = Webhook(
            user_id=auth_user.id,
            url="https://example.com/webhook",
            secret="test-secret-key-hex",
            event_types="policy.created,claim.created",
            is_active=True,
        )
        db_session.add(webhook)
        db_session.commit()
        db_session.refresh(webhook)

        assert webhook.id is not None
        assert webhook.is_active is True
        assert webhook.get_event_types() == ["policy.created", "claim.created"]

    def test_webhook_subscribes_to(self, db_session, auth_user):
        webhook = Webhook(
            user_id=auth_user.id,
            url="https://example.com/webhook",
            secret="test-secret",
            event_types="policy.created",
        )
        db_session.add(webhook)
        db_session.commit()

        assert webhook.subscribes_to("policy.created") is True
        assert webhook.subscribes_to("claim.created") is False

    def test_webhook_delivery_creation(self, db_session, auth_user):
        webhook = Webhook(
            user_id=auth_user.id,
            url="https://example.com/webhook",
            secret="test-secret",
            event_types="policy.created",
        )
        db_session.add(webhook)
        db_session.commit()

        delivery = WebhookDelivery(
            webhook_id=webhook.id,
            event_type="policy.created",
            payload='{"event": "policy.created"}',
            success=False,
            attempts=0,
        )
        db_session.add(delivery)
        db_session.commit()
        db_session.refresh(delivery)

        assert delivery.id is not None
        assert delivery.success is False
        assert delivery.attempts == 0


class TestWebhookRoutes:
    """Test webhook CRUD endpoints."""

    def test_create_webhook(self, client, auth_headers):
        response = client.post("/webhooks/", headers=auth_headers, json={
            "url": "https://example.com/webhook",
            "event_types": ["policy.created", "claim.created"],
        })
        assert response.status_code == 201
        data = response.json()
        assert data["url"] == "https://example.com/webhook"
        assert "policy.created" in data["event_types"]
        assert data["is_active"] is True

    def test_create_webhook_invalid_url(self, client, auth_headers):
        response = client.post("/webhooks/", headers=auth_headers, json={
            "url": "not-a-valid-url",
            "event_types": ["policy.created"],
        })
        assert response.status_code == 422

    def test_create_webhook_invalid_event_type(self, client, auth_headers):
        response = client.post("/webhooks/", headers=auth_headers, json={
            "url": "https://example.com/webhook",
            "event_types": ["invalid.event"],
        })
        assert response.status_code == 422

    def test_list_webhooks(self, client, auth_headers):
        # Create a webhook first
        client.post("/webhooks/", headers=auth_headers, json={
            "url": "https://example.com/wh1",
            "event_types": ["policy.created"],
        })
        response = client.get("/webhooks/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_webhook(self, client, auth_headers):
        create_resp = client.post("/webhooks/", headers=auth_headers, json={
            "url": "https://example.com/wh-detail",
            "event_types": ["claim.created"],
        })
        webhook_id = create_resp.json()["id"]
        response = client.get(f"/webhooks/{webhook_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == webhook_id

    def test_get_webhook_not_found(self, client, auth_headers):
        response = client.get("/webhooks/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_update_webhook(self, client, auth_headers):
        create_resp = client.post("/webhooks/", headers=auth_headers, json={
            "url": "https://example.com/wh-update",
            "event_types": ["policy.created"],
        })
        webhook_id = create_resp.json()["id"]
        response = client.patch(f"/webhooks/{webhook_id}", headers=auth_headers, json={
            "url": "https://example.com/wh-updated",
            "is_active": False,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://example.com/wh-updated"
        assert data["is_active"] is False

    def test_delete_webhook(self, client, auth_headers):
        create_resp = client.post("/webhooks/", headers=auth_headers, json={
            "url": "https://example.com/wh-delete",
            "event_types": ["policy.created"],
        })
        webhook_id = create_resp.json()["id"]
        response = client.delete(f"/webhooks/{webhook_id}", headers=auth_headers)
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()

        # Verify it's gone
        get_resp = client.get(f"/webhooks/{webhook_id}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_list_webhook_deliveries(self, client, auth_headers, db_session, auth_user):
        # Create webhook
        webhook = Webhook(
            user_id=auth_user.id,
            url="https://example.com/wh-deliveries",
            secret="test-secret",
            event_types="policy.created",
        )
        db_session.add(webhook)
        db_session.commit()
        db_session.refresh(webhook)

        # Create delivery
        delivery = WebhookDelivery(
            webhook_id=webhook.id,
            event_type="policy.created",
            payload='{"event": "policy.created"}',
        )
        db_session.add(delivery)
        db_session.commit()

        response = client.get(f"/webhooks/{webhook.id}/deliveries", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_webhooks_require_authentication(self, client):
        response = client.get("/webhooks/")
        assert response.status_code in (401, 403)


class TestWebhookService:
    """Test webhook delivery service logic."""

    def test_generate_signature(self):
        from src.services.webhook_service import _generate_signature
        sig = _generate_signature('{"test": true}', "secret-key")
        assert isinstance(sig, str)
        assert len(sig) == 64  # SHA-256 hex digest

    def test_verify_webhook_signature(self):
        from src.services.webhook_service import _generate_signature, verify_webhook_signature
        payload = '{"event": "policy.created"}'
        secret = "my-secret"
        sig = f"sha256={_generate_signature(payload, secret)}"
        assert verify_webhook_signature(payload, sig, secret) is True
        assert verify_webhook_signature(payload, "sha256=invalid", secret) is False

    def test_dispatch_with_no_webhooks(self, db_session, auth_user):
        from src.services.webhook_service import dispatch_webhook_event
        deliveries = dispatch_webhook_event(
            db=db_session,
            user_id=auth_user.id,
            event_type="policy.created",
            payload={"policy_id": 1},
        )
        assert deliveries == []

    @patch("src.services.webhook_service.httpx.Client")
    def test_dispatch_successful_delivery(self, mock_client_cls, db_session, auth_user):
        """Test successful webhook delivery."""
        # Setup mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "OK"
        mock_client_instance = MagicMock()
        mock_client_instance.__enter__ = MagicMock(return_value=mock_client_instance)
        mock_client_instance.__exit__ = MagicMock(return_value=False)
        mock_client_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_client_instance

        # Create webhook
        webhook = Webhook(
            user_id=auth_user.id,
            url="https://example.com/hook",
            secret="test-secret",
            event_types="policy.created",
        )
        db_session.add(webhook)
        db_session.commit()

        from src.services.webhook_service import dispatch_webhook_event
        deliveries = dispatch_webhook_event(
            db=db_session,
            user_id=auth_user.id,
            event_type="policy.created",
            payload={"policy_id": 1},
        )
        assert len(deliveries) == 1
        assert deliveries[0].success is True
        assert deliveries[0].response_status == 200

    @patch("src.services.webhook_service.httpx.Client")
    def test_dispatch_failed_delivery_retries(self, mock_client_cls, db_session, auth_user):
        """Test webhook delivery retries on failure."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Server Error"
        mock_client_instance = MagicMock()
        mock_client_instance.__enter__ = MagicMock(return_value=mock_client_instance)
        mock_client_instance.__exit__ = MagicMock(return_value=False)
        mock_client_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_client_instance

        webhook = Webhook(
            user_id=auth_user.id,
            url="https://example.com/fail-hook",
            secret="test-secret",
            event_types="claim.created",
        )
        db_session.add(webhook)
        db_session.commit()

        from src.services.webhook_service import dispatch_webhook_event
        deliveries = dispatch_webhook_event(
            db=db_session,
            user_id=auth_user.id,
            event_type="claim.created",
            payload={"claim_id": 1},
        )
        assert len(deliveries) == 1
        assert deliveries[0].success is False
        assert deliveries[0].attempts == 3  # max retries


class TestWebhookEventTypes:
    """Test webhook event type validation."""

    def test_valid_event_types(self):
        from src.schemas import VALID_WEBHOOK_EVENTS
        assert "policy.created" in VALID_WEBHOOK_EVENTS
        assert "policy.cancelled" in VALID_WEBHOOK_EVENTS
        assert "claim.created" in VALID_WEBHOOK_EVENTS
        assert "claim.approved" in VALID_WEBHOOK_EVENTS
        assert "claim.rejected" in VALID_WEBHOOK_EVENTS

    def test_webhook_event_type_enum(self):
        assert WebhookEventType.policy_created.value == "policy.created"
        assert WebhookEventType.claim_created.value == "claim.created"
