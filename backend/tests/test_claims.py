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


def test_list_claims_includes_total_pages(
    client, auth_headers, auth_user, policy_factory, claim_factory, db_session
):
    """Test that list_claims includes total_pages in response"""
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    
    # Create 15 claims
    for i in range(15):
        claim_factory(auth_user, policy, claim_amount=100.0 + i)
    
    # Test with per_page=10
    response = client.get("/claims/?page=1&per_page=10", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "total_pages" in data
    assert data["total_pages"] == 2  # 15 items / 10 per page = 2 pages
    assert data["total"] == 15
    assert len(data["claims"]) == 10


def test_list_claims_total_pages_non_divisible(
    client, auth_headers, auth_user, policy_factory, claim_factory, db_session
):
    """Test that total_pages rounds up correctly for non-divisible totals"""
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    
    # Create 23 claims
    for i in range(23):
        claim_factory(auth_user, policy, claim_amount=100.0 + i)
    
    # Test with per_page=7
    response = client.get("/claims/?page=1&per_page=7", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 4  # 23 items / 7 per page = 4 pages (rounded up)
    assert data["total"] == 23


def test_list_claims_total_pages_empty_result(
    client, auth_headers, auth_user, db_session
):
    """Test that total_pages is 0 for empty results"""
    response = client.get("/claims/", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 0
    assert data["total"] == 0


def test_list_claims_by_policy_includes_total_pages(
    client, auth_headers, auth_user, policy_factory, claim_factory, db_session
):
    """Test that list_claims_by_policy includes total_pages in response"""
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    
    # Create 12 claims
    for i in range(12):
        claim_factory(auth_user, policy, claim_amount=100.0 + i)
    
    # Test with per_page=5
    response = client.get(
        f"/claims/policy/{policy.id}?page=1&per_page=5",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total_pages" in data
    assert data["total_pages"] == 3  # 12 items / 5 per page = 3 pages (rounded up)
    assert data["total"] == 12
    assert len(data["claims"]) == 5


def test_list_claims_by_policy_total_pages_empty(
    client, auth_headers, auth_user, policy_factory, db_session
):
    """Test that total_pages is 0 for empty policy claims"""
    policy = policy_factory(auth_user, status=PolicyStatus.active)
    
    response = client.get(f"/claims/policy/{policy.id}", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 0
    assert data["total"] == 0


def test_list_claims_by_policy_total_pages_exact_division(
    client, auth_headers, auth_user, policy_factory, claim_factory, db_session
):
    """Test total_pages when total divides evenly by per_page"""
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)
    
    # Create exactly 20 claims
    for i in range(20):
        claim_factory(auth_user, policy, claim_amount=100.0 + i)
    
    # Test with per_page=10 (divides evenly)
    response = client.get(
        f"/claims/policy/{policy.id}?page=1&per_page=10",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 2  # 20 items / 10 per page = exactly 2 pages
    assert data["total"] == 20
