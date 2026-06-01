from datetime import datetime

from src.models import PolicyStatus, PolicyType


def test_create_policy_success(client, auth_headers):
    now = int(datetime.utcnow().timestamp())

    response = client.post(
        "/policies/",
        headers=auth_headers,
        json={
            "policy_type": "weather",
            "coverage_amount": 1000.0,
            "premium": 50.0,
            "start_time": now,
            "end_time": now + 86400,
            "trigger_condition": "Temperature below -10C",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["policy_type"] == "weather"
    assert data["status"] == "active"
    assert data["claim_amount"] == 0.0


def test_create_policy_rejects_invalid_time_range(client, auth_headers):
    now = int(datetime.utcnow().timestamp())

    response = client.post(
        "/policies/",
        headers=auth_headers,
        json={
            "policy_type": "weather",
            "coverage_amount": 1000.0,
            "premium": 50.0,
            "start_time": now + 86400,
            "end_time": now,
            "trigger_condition": "Temperature below -10C",
        },
    )

    assert response.status_code == 422


def test_get_user_policies_supports_filters_and_pagination(
    client, auth_headers, auth_user, policy_factory
):
    policy_factory(auth_user, policy_type=PolicyType.weather)
    policy_factory(auth_user, policy_type=PolicyType.flight, status=PolicyStatus.cancelled)

    response = client.get(
        "/policies/?status=cancelled&policy_type=flight&page=1&per_page=10",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["policies"][0]["policy_type"] == "flight"
    assert data["policies"][0]["status"] == "cancelled"


def test_get_policy_returns_owned_policy(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user)

    response = client.get(f"/policies/{policy.id}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == policy.id


def test_cancel_policy_marks_policy_cancelled(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user)

    response = client.delete(f"/policies/{policy.id}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["message"] == "Policy cancelled successfully"

    updated = client.get(f"/policies/{policy.id}", headers=auth_headers).json()
    assert updated["status"] == "cancelled"


def test_submit_claim_from_policy_endpoint(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user)

    response = client.post(
        f"/policies/{policy.id}/claims",
        headers=auth_headers,
        json={
            "policy_id": policy.id,
            "claim_amount": 250.0,
            "proof": "NOAA export",
        },
    )

    assert response.status_code == 201
    assert response.json()["policy_id"] == policy.id
    assert response.json()["claim_amount"] == 250.0


def test_policy_routes_require_authentication(client):
    response = client.get("/policies/")

    assert response.status_code == 403


def test_get_user_policies_filter_by_account_own_address(
    client, auth_headers, auth_user, wallet_address, policy_factory
):
    """Filtering by the authenticated user's own stellar_address returns their policies."""
    policy_factory(auth_user, policy_type=PolicyType.weather)
    policy_factory(auth_user, policy_type=PolicyType.flight)

    response = client.get(
        f"/policies/?account={wallet_address}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2


def test_get_user_policies_filter_by_account_other_address_returns_empty(
    client, auth_headers, auth_user, policy_factory, second_wallet_address
):
    """Filtering by another user's stellar_address returns empty results (not their policies)."""
    policy_factory(auth_user)

    response = client.get(
        f"/policies/?account={second_wallet_address}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["policies"] == []


def test_get_user_policies_pagination_metadata(
    client, auth_headers, auth_user, policy_factory
):
    """Response includes correct pagination metadata."""
    for _ in range(5):
        policy_factory(auth_user)

    response = client.get(
        "/policies/?page=1&per_page=2",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["per_page"] == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3
    assert data["has_next"] is True
    assert len(data["policies"]) == 2


def test_get_user_policies_last_page_has_next_false(
    client, auth_headers, auth_user, policy_factory
):
    """has_next is False on the last page."""
    for _ in range(3):
        policy_factory(auth_user)

    response = client.get(
        "/policies/?page=2&per_page=2",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["has_next"] is False
