"""Integration tests for end-to-end webhook dispatch flow (Issue #224)."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import MagicMock

import pytest

from src.models import Webhook, WebhookDelivery
from src.services import webhook_service


def _now() -> int:
    return int(datetime.utcnow().timestamp())


def _create_policy(client, headers: dict) -> dict:
    now = _now()
    response = client.post(
        "/policies/",
        headers=headers,
        json={
            "policy_type": "weather",
            "coverage_amount": 1000.0,
            "premium": 25.0,
            "start_time": now,
            "end_time": now + 86_400,
            "trigger_condition": "rainfall > 100mm",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def _create_webhook(client, headers: dict, event_types: list[str]) -> int:
    response = client.post(
        "/webhooks/",
        headers=headers,
        json={
            "url": "https://mocked-webhook.local/endpoint",
            "event_types": event_types,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


class _SuccessClient:
    """Mocked HTTP client that always returns success and captures request data."""

    calls: list[dict] = []

    def __init__(self, timeout=None):
        self.timeout = timeout

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url, content=None, headers=None):
        self.__class__.calls.append(
            {
                "url": url,
                "content": content,
                "headers": headers or {},
            }
        )
        response = MagicMock()
        response.status_code = 200
        response.text = "OK"
        return response


class _FailingClient:
    """Mocked HTTP client that always fails with 500 and tracks attempts."""

    calls: int = 0

    def __init__(self, timeout=None):
        self.timeout = timeout

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url, content=None, headers=None):
        self.__class__.calls += 1
        response = MagicMock()
        response.status_code = 500
        response.text = "Server Error"
        return response


def test_policy_creation_dispatches_webhook_with_valid_signature(
    client, auth_headers, db_session, monkeypatch
):
    _SuccessClient.calls = []
    monkeypatch.setattr("src.services.webhook_service.httpx.Client", _SuccessClient)

    webhook_id = _create_webhook(client, auth_headers, ["policy.created"])
    _create_policy(client, auth_headers)

    delivery = (
        db_session.query(WebhookDelivery)
        .join(Webhook, Webhook.id == WebhookDelivery.webhook_id)
        .filter(Webhook.id == webhook_id, WebhookDelivery.event_type == "policy.created")
        .first()
    )
    assert delivery is not None
    assert delivery.success is True

    assert len(_SuccessClient.calls) == 1
    call = _SuccessClient.calls[0]
    assert call["headers"]["X-Webhook-Event"] == "policy.created"

    webhook = db_session.get(Webhook, webhook_id)
    assert webhook_service.verify_webhook_signature(
        call["content"],
        call["headers"]["X-Webhook-Signature"],
        webhook.secret,
    )


def test_claim_submission_dispatches_webhook(client, auth_headers, db_session, monkeypatch):
    _SuccessClient.calls = []
    monkeypatch.setattr("src.services.webhook_service.httpx.Client", _SuccessClient)

    webhook_id = _create_webhook(client, auth_headers, ["claim.created"])
    policy = _create_policy(client, auth_headers)

    response = client.post(
        "/claims/",
        headers=auth_headers,
        json={
            "policy_id": policy["id"],
            "claim_amount": 120.0,
            "proof": "sensor proof",
        },
    )
    assert response.status_code == 201, response.text

    delivery = (
        db_session.query(WebhookDelivery)
        .join(Webhook, Webhook.id == WebhookDelivery.webhook_id)
        .filter(Webhook.id == webhook_id, WebhookDelivery.event_type == "claim.created")
        .first()
    )
    assert delivery is not None
    assert delivery.success is True
    assert len(_SuccessClient.calls) >= 1
    assert any(c["headers"]["X-Webhook-Event"] == "claim.created" for c in _SuccessClient.calls)


@pytest.mark.parametrize(
    ("approved", "expected_event"),
    [
        (True, "claim.approved"),
        (False, "claim.rejected"),
    ],
)
def test_claim_processing_dispatches_webhook_event_types(
    client, auth_headers, admin_headers, db_session, monkeypatch, approved, expected_event
):
    _SuccessClient.calls = []
    monkeypatch.setattr("src.services.webhook_service.httpx.Client", _SuccessClient)

    webhook_id = _create_webhook(client, auth_headers, [expected_event])
    policy = _create_policy(client, auth_headers)

    claim_resp = client.post(
        "/claims/",
        headers=auth_headers,
        json={
            "policy_id": policy["id"],
            "claim_amount": 100.0,
            "proof": "processing proof",
        },
    )
    assert claim_resp.status_code == 201, claim_resp.text
    claim_id = claim_resp.json()["id"]

    process_resp = client.patch(
        f"/claims/{claim_id}?approved={'true' if approved else 'false'}",
        headers=admin_headers,
    )
    assert process_resp.status_code == 200, process_resp.text

    delivery = (
        db_session.query(WebhookDelivery)
        .join(Webhook, Webhook.id == WebhookDelivery.webhook_id)
        .filter(Webhook.id == webhook_id, WebhookDelivery.event_type == expected_event)
        .first()
    )
    assert delivery is not None
    assert delivery.success is True
    assert any(c["headers"]["X-Webhook-Event"] == expected_event for c in _SuccessClient.calls)


def test_policy_cancellation_dispatches_webhook(client, auth_headers, db_session, monkeypatch):
    _SuccessClient.calls = []
    monkeypatch.setattr("src.services.webhook_service.httpx.Client", _SuccessClient)

    webhook_id = _create_webhook(client, auth_headers, ["policy.cancelled"])
    policy = _create_policy(client, auth_headers)

    cancel_resp = client.delete(f"/policies/{policy['id']}", headers=auth_headers)
    assert cancel_resp.status_code == 200, cancel_resp.text

    delivery = (
        db_session.query(WebhookDelivery)
        .join(Webhook, Webhook.id == WebhookDelivery.webhook_id)
        .filter(Webhook.id == webhook_id, WebhookDelivery.event_type == "policy.cancelled")
        .first()
    )
    assert delivery is not None
    assert delivery.success is True


def test_webhook_retry_behavior_on_failed_delivery(
    client, auth_headers, db_session, monkeypatch
):
    _FailingClient.calls = 0
    monkeypatch.setattr("src.services.webhook_service.httpx.Client", _FailingClient)

    webhook_id = _create_webhook(client, auth_headers, ["policy.created"])
    _create_policy(client, auth_headers)

    delivery = (
        db_session.query(WebhookDelivery)
        .join(Webhook, Webhook.id == WebhookDelivery.webhook_id)
        .filter(Webhook.id == webhook_id, WebhookDelivery.event_type == "policy.created")
        .first()
    )
    assert delivery is not None
    assert delivery.success is False
    assert delivery.attempts == webhook_service.settings.webhook_max_retries
    assert _FailingClient.calls == webhook_service.settings.webhook_max_retries
