from io import BytesIO

import pytest
from src.models import Policy, PolicyStatus


def test_create_claim_success(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user, coverage_amount=1000.0)

    response = client.post(
        "/claims/",
        headers=auth_headers,
        json={
            "policy_id": policy.id,
            "claim_amount": 300.0,
            "proof": "Satellite weather evidence",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["policy_id"] == policy.id
    assert data["approved"] is False


def test_create_claim_rejects_amount_over_remaining_coverage(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user, coverage_amount=100.0)

    response = client.post(
        "/claims/",
        headers=auth_headers,
        json={
            "policy_id": policy.id,
            "claim_amount": 250.0,
            "proof": "Satellite weather evidence",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Claim amount exceeds remaining coverage"


def test_get_claim_by_id(
    client, auth_headers, auth_user, policy_factory, claim_factory
):
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    claim = claim_factory(auth_user, policy)

    response = client.get(f"/claims/{claim.id}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == claim.id


def test_list_claims_supports_filters(
    client, auth_headers, auth_user, policy_factory, claim_factory
):
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    approved_claim = claim_factory(auth_user, policy, approved=True)
    claim_factory(auth_user, policy, approved=False, claim_amount=50.0)

    response = client.get(
        f"/claims/?approved=true&policy_id={policy.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["claims"][0]["id"] == approved_claim.id


def test_update_claim_status_approve_updates_policy(
    client, admin_headers, auth_user, policy_factory, claim_factory, db_session
):
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    claim = claim_factory(auth_user, policy, claim_amount=125.0)

    response = client.patch(
        f"/claims/{claim.id}?approved=true",
        headers=admin_headers,
    )

    assert response.status_code == 200
    refreshed_policy = db_session.get(Policy, policy.id)
    assert refreshed_policy.status == PolicyStatus.claim_approved


def test_update_claim_status_reject_sets_rejected_policy(
    client, admin_headers, auth_user, policy_factory, claim_factory, db_session
):
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    claim = claim_factory(auth_user, policy, claim_amount=125.0)

    response = client.patch(
        f"/claims/{claim.id}?approved=false",
        headers=admin_headers,
    )

    assert response.status_code == 200
    refreshed_policy = db_session.get(Policy, policy.id)
    assert refreshed_policy.status == PolicyStatus.claim_rejected


def test_non_admin_cannot_approve_own_claim(
    client, auth_headers, auth_user, policy_factory, claim_factory
):
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    claim = claim_factory(auth_user, policy, claim_amount=125.0)

    response = client.patch(
        f"/claims/{claim.id}?approved=true",
        headers=auth_headers,
    )

    assert response.status_code == 403


def test_admin_can_approve_any_claim(
    client, admin_headers, user_factory, second_wallet_address, policy_factory, claim_factory, db_session
):
    other_user = user_factory(second_wallet_address)
    policy = policy_factory(other_user, status=PolicyStatus.claim_pending)
    claim = claim_factory(other_user, policy, claim_amount=50.0)

    response = client.patch(
        f"/claims/{claim.id}?approved=true",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["approved"] is True


def test_create_claim_with_file_upload(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user)

    response = client.post(
        "/claims/upload",
        headers=auth_headers,
        data={"policy_id": str(policy.id), "claim_amount": "275.0"},
        files={"file": ("proof.png", BytesIO(b"png"), "image/png")},
    )

    assert response.status_code == 201
    assert response.json()["policy_id"] == policy.id


def test_create_claim_with_invalid_file_type(
    client, auth_headers, auth_user, policy_factory
):
    policy = policy_factory(auth_user)

    response = client.post(
        "/claims/upload",
        headers=auth_headers,
        data={"policy_id": str(policy.id), "claim_amount": "275.0"},
        files={"file": ("proof.txt", BytesIO(b"text"), "text/plain")},
    )

    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"]


def test_list_claims_by_policy(
    client, auth_headers, auth_user, policy_factory, claim_factory
):
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    claim_factory(auth_user, policy)

    response = client.get(f"/claims/policy/{policy.id}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_claim_routes_require_authentication(client):
    response = client.get("/claims/")

    assert response.status_code in (401, 403)
