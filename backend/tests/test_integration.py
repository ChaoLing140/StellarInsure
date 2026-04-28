"""
Integration tests for the StellarInsure backend.

These tests exercise *complete request flows* through the HTTP layer (using
FastAPI's TestClient) and independently verify the resulting database state via
``db_session``.  Every test starts with an empty, freshly-created SQLite database
(courtesy of the ``db_session`` fixture in conftest.py), so tests are fully
isolated and self-cleaning — no manual teardown required.

Covered flows
-------------
* Auth   – login, register, token refresh, profile read/update
* Policy – create → list → get → cancel lifecycle + filters + pagination
* Claim  – submit → approve/reject lifecycle + file upload + guard rails
* DB     – atomic commit verification for multi-table writes
* Multi-user – row-level isolation (one user cannot touch another's resources)
* Webhook – create → list → get → update → delete CRUD + ownership scoping
"""

from __future__ import annotations

from datetime import datetime
from io import BytesIO

import pytest

from src.auth import create_access_token
from src.models import Claim, Policy, PolicyStatus, PolicyType, User, Webhook

# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------

STELLAR_A = "G" + "A" * 55  # primary test wallet (56 chars)
STELLAR_B = "G" + "B" * 55  # secondary test wallet (56 chars)
STELLAR_C = "G" + "C" * 55  # third test wallet (register tests)
STELLAR_ADMIN = "G" + "D" * 55  # admin wallet (56 chars)


def _auth_message() -> str:
    return f"StellarInsure Authentication {datetime.utcnow().strftime('%Y-%m-%d')}"


def _login(client, stellar_address: str) -> dict:
    """POST /auth/login and return parsed JSON (includes access_token).

    Only used inside ``TestAuthFlow`` tests that deliberately exercise the login
    endpoint.  All other test classes obtain tokens via ``create_access_token``
    directly so they never touch the rate-limited /auth/login route.
    """
    resp = client.post(
        "/auth/login",
        json={
            "stellar_address": stellar_address,
            "signature": "integration-test-sig",
            "message": _auth_message(),
        },
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


def _ensure_user(db_session, stellar_address: str, is_admin: bool = False) -> User:
    """Return an existing user or create one directly in the DB."""
    user = db_session.query(User).filter_by(stellar_address=stellar_address).first()
    if user is None:
        user = User(stellar_address=stellar_address, is_admin=is_admin)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


def _token_headers(db_session, stellar_address: str, is_admin: bool = False) -> dict:
    """Create a user (if needed) and return Bearer auth headers via JWT directly.

    This never hits the HTTP login endpoint, so it doesn't consume any rate
    limit quota.
    """
    user = _ensure_user(db_session, stellar_address, is_admin=is_admin)
    token = create_access_token({"sub": str(user.id), "stellar_address": user.stellar_address})
    return {"Authorization": f"Bearer {token}"}


def _now() -> int:
    return int(datetime.utcnow().timestamp())


def _policy_payload(**overrides) -> dict:
    """Return a valid policy-creation body with sensible defaults."""
    now = _now()
    return {
        "policy_type": overrides.get("policy_type", "weather"),
        "coverage_amount": overrides.get("coverage_amount", 1_000.0),
        "premium": overrides.get("premium", 50.0),
        "start_time": overrides.get("start_time", now),
        "end_time": overrides.get("end_time", now + 86_400),
        "trigger_condition": overrides.get("trigger_condition", "rainfall > 100mm"),
    }


def _create_policy(client, headers: dict, **overrides) -> dict:
    """POST /policies/ and return the created policy JSON."""
    resp = client.post("/policies/", headers=headers, json=_policy_payload(**overrides))
    assert resp.status_code == 201, resp.text
    return resp.json()


def _submit_claim(client, headers: dict, policy_id: int, amount: float = 100.0) -> dict:
    """POST /claims/ against *policy_id* and return the created claim JSON."""
    resp = client.post(
        "/claims/",
        headers=headers,
        json={
            "policy_id": policy_id,
            "claim_amount": amount,
            "proof": "Integration test proof — sensor reading confirmed",
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Local fixtures (integration-test-specific)
# ---------------------------------------------------------------------------


@pytest.fixture()
def headers_a(db_session):
    """Auth headers for wallet A — issued via create_access_token (no HTTP call)."""
    return _token_headers(db_session, STELLAR_A)


@pytest.fixture()
def headers_b(db_session):
    """Auth headers for wallet B — issued via create_access_token (no HTTP call)."""
    return _token_headers(db_session, STELLAR_B)


@pytest.fixture()
def admin_headers(db_session):
    """Auth headers for an admin user — can approve/reject any claim."""
    return _token_headers(db_session, STELLAR_ADMIN, is_admin=True)


@pytest.fixture()
def policy_a(client, headers_a):
    """A policy owned by wallet-A, active and not expired."""
    return _create_policy(client, headers_a)


# ===========================================================================
# 1. Auth flow integration tests
# ===========================================================================


class TestAuthFlow:
    """Full authentication lifecycle exercised through the HTTP API."""

    def test_login_auto_creates_user_in_database(self, client, db_session):
        """Logging in with a new wallet address must create a User row."""
        _login(client, STELLAR_A)

        db_session.expire_all()
        user = db_session.query(User).filter_by(stellar_address=STELLAR_A).first()
        assert user is not None
        assert user.stellar_address == STELLAR_A

    def test_login_returns_access_and_refresh_tokens(self, client):
        """Login response must contain both token types and bearer type."""
        data = _login(client, STELLAR_A)
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    def test_login_twice_reuses_same_user_row(self, client, db_session):
        """A second login with the same wallet must not create a duplicate user."""
        _login(client, STELLAR_A)
        _login(client, STELLAR_A)

        db_session.expire_all()
        count = db_session.query(User).filter_by(stellar_address=STELLAR_A).count()
        assert count == 1

    def test_register_creates_new_user_then_returns_tokens(self, client, db_session):
        """POST /auth/register must persist a new user and return valid tokens."""
        resp = client.post(
            "/auth/register",
            json={
                "stellar_address": STELLAR_C,
                "signature": "sig",
                "message": _auth_message(),
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data

        db_session.expire_all()
        user = db_session.query(User).filter_by(stellar_address=STELLAR_C).first()
        assert user is not None

    def test_register_rejects_duplicate_wallet(self, client):
        """Registering the same wallet a second time must return 400."""
        payload = {
            "stellar_address": STELLAR_A,
            "signature": "sig",
            "message": _auth_message(),
        }
        client.post("/auth/register", json=payload)
        resp = client.post("/auth/register", json=payload)
        assert resp.status_code == 400

    def test_refresh_token_issues_new_access_token(self, client):
        """A valid refresh token must produce a fresh pair of tokens."""
        tokens = _login(client, STELLAR_A)
        resp = client.post(
            "/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]},
        )
        assert resp.status_code == 200
        new_tokens = resp.json()
        assert "access_token" in new_tokens
        # New access token is valid — use it to hit a protected endpoint.
        me_resp = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {new_tokens['access_token']}"},
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["stellar_address"] == STELLAR_A

    def test_get_me_returns_authenticated_user_profile(self, client, headers_a):
        """GET /auth/me must reflect the currently authenticated user."""
        resp = client.get("/auth/me", headers=headers_a)
        assert resp.status_code == 200
        data = resp.json()
        assert data["stellar_address"] == STELLAR_A
        assert "id" in data
        assert "created_at" in data

    def test_update_profile_email_persists_to_database(self, client, headers_a, db_session):
        """PATCH /auth/me must update email and commit to the database."""
        resp = client.patch(
            "/auth/me",
            headers=headers_a,
            json={"email": "integration@example.com"},
        )
        assert resp.status_code == 200
        assert resp.json()["email"] == "integration@example.com"

        db_session.expire_all()
        user = db_session.query(User).filter_by(stellar_address=STELLAR_A).first()
        assert user.email == "integration@example.com"

    def test_protected_endpoints_reject_unauthenticated_requests(self, client):
        """Requests without a Bearer token must be rejected (403 from HTTPBearer)."""
        for path in ("/policies/", "/claims/", "/auth/me"):
            status = client.get(path).status_code
            assert status in (401, 403), f"Expected 401/403 for {path}, got {status}"


# ===========================================================================
# 2. Policy end-to-end flow tests
# ===========================================================================


class TestPolicyFlow:
    """Complete policy lifecycle: create → list → get → filter → cancel."""

    def test_create_policy_stores_correct_row_in_database(
        self, client, headers_a, db_session
    ):
        """Creating a policy via the API must persist all fields to the DB."""
        payload = _policy_payload(coverage_amount=2_500.0, premium=75.0)
        resp = client.post("/policies/", headers=headers_a, json=payload)
        assert resp.status_code == 201

        pid = resp.json()["id"]
        db_session.expire_all()
        policy = db_session.get(Policy, pid)
        assert policy is not None
        assert float(policy.coverage_amount) == 2_500.0
        assert float(policy.premium) == 75.0
        assert policy.status == PolicyStatus.active
        assert float(policy.claim_amount) == 0.0

    def test_create_list_get_full_policy_lifecycle(self, client, headers_a):
        """Create a policy, confirm it appears in the list, then retrieve it by ID."""
        created = _create_policy(client, headers_a, trigger_condition="temp < -5C")

        # It must appear in the user's policy list.
        list_resp = client.get("/policies/", headers=headers_a)
        assert list_resp.status_code == 200
        ids_in_list = [p["id"] for p in list_resp.json()["policies"]]
        assert created["id"] in ids_in_list

        # Direct fetch by ID must return the same data.
        get_resp = client.get(f"/policies/{created['id']}", headers=headers_a)
        assert get_resp.status_code == 200
        assert get_resp.json()["trigger_condition"] == "temp < -5C"

    def test_cancel_policy_transitions_status_and_persists(
        self, client, headers_a, db_session, policy_a
    ):
        """DELETE /policies/{id} must set status=cancelled in the database."""
        resp = client.delete(f"/policies/{policy_a['id']}", headers=headers_a)
        assert resp.status_code == 200
        assert resp.json()["message"] == "Policy cancelled successfully"

        # Verify status in DB, not just from API response.
        db_session.expire_all()
        policy = db_session.get(Policy, policy_a["id"])
        assert policy.status == PolicyStatus.cancelled

    def test_cancelled_policy_status_visible_in_get(
        self, client, headers_a, policy_a
    ):
        """After cancellation, GET /policies/{id} must return status=cancelled."""
        client.delete(f"/policies/{policy_a['id']}", headers=headers_a)
        resp = client.get(f"/policies/{policy_a['id']}", headers=headers_a)
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    def test_list_policies_pagination_has_next_flag(self, client, headers_a):
        """Creating 12 policies with per_page=10 must report has_next=True on page 1."""
        for _ in range(12):
            _create_policy(client, headers_a)

        resp = client.get("/policies/?page=1&per_page=10", headers=headers_a)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 12
        assert data["has_next"] is True
        assert len(data["policies"]) == 10

        # Page 2 contains the remaining policies and has_next=False.
        resp2 = client.get("/policies/?page=2&per_page=10", headers=headers_a)
        page2 = resp2.json()
        assert page2["has_next"] is False

    def test_filter_policies_by_status(self, client, headers_a):
        """GET /policies/?status=cancelled must return only cancelled policies."""
        # Create one active via API and cancel it.
        pol = _create_policy(client, headers_a)
        client.delete(f"/policies/{pol['id']}", headers=headers_a)
        # Create another active policy (not cancelled).
        _create_policy(client, headers_a)

        resp = client.get("/policies/?status=cancelled", headers=headers_a)
        assert resp.status_code == 200
        data = resp.json()
        assert all(p["status"] == "cancelled" for p in data["policies"])
        ids = [p["id"] for p in data["policies"]]
        assert pol["id"] in ids

    def test_filter_policies_by_type(self, client, headers_a):
        """GET /policies/?policy_type=flight must return only flight policies."""
        _create_policy(client, headers_a, policy_type="weather")
        flight = _create_policy(client, headers_a, policy_type="flight")

        resp = client.get("/policies/?policy_type=flight", headers=headers_a)
        assert resp.status_code == 200
        data = resp.json()
        assert all(p["policy_type"] == "flight" for p in data["policies"])
        assert any(p["id"] == flight["id"] for p in data["policies"])

    def test_invalid_time_range_returns_400(self, client, headers_a):
        """A policy where end_time ≤ start_time must be rejected with 422."""
        now = _now()
        resp = client.post(
            "/policies/",
            headers=headers_a,
            json=_policy_payload(start_time=now + 3_600, end_time=now),
        )
        assert resp.status_code in (400, 422)

    def test_get_nonexistent_policy_returns_404(self, client, headers_a):
        """Fetching a policy ID that doesn't exist must return 404."""
        resp = client.get("/policies/99999", headers=headers_a)
        assert resp.status_code == 404


# ===========================================================================
# 3. Claim end-to-end flow tests
# ===========================================================================


class TestClaimFlow:
    """Complete claim lifecycle: submit → approve/reject → state verified in DB."""

    def test_submit_claim_transitions_policy_to_claim_pending_in_db(
        self, client, headers_a, policy_a, db_session
    ):
        """Submitting a claim must atomically set policy.status=claim_pending."""
        _submit_claim(client, headers_a, policy_a["id"])

        db_session.expire_all()
        policy = db_session.get(Policy, policy_a["id"])
        assert policy.status == PolicyStatus.claim_pending

    def test_submit_claim_creates_claim_row_in_db(
        self, client, headers_a, policy_a, db_session
    ):
        """A new Claim row must be present in the DB after POST /claims/."""
        claim = _submit_claim(client, headers_a, policy_a["id"], amount=200.0)

        db_session.expire_all()
        db_claim = db_session.get(Claim, claim["id"])
        assert db_claim is not None
        assert float(db_claim.claim_amount) == 200.0
        assert db_claim.approved is False

    def test_approve_claim_transitions_policy_to_claim_approved_in_db(
        self, client, headers_a, admin_headers, policy_a, db_session
    ):
        """Approving a claim must flip policy.status to claim_approved in the DB."""
        claim = _submit_claim(client, headers_a, policy_a["id"], amount=150.0)
        resp = client.patch(
            f"/claims/{claim['id']}?approved=true", headers=admin_headers
        )
        assert resp.status_code == 200

        db_session.expire_all()
        policy = db_session.get(Policy, policy_a["id"])
        assert policy.status == PolicyStatus.claim_approved

    def test_approve_claim_accumulates_claim_amount_in_db(
        self, client, headers_a, admin_headers, policy_a, db_session
    ):
        """Approving a claim must add the claim_amount to policy.claim_amount."""
        claim = _submit_claim(client, headers_a, policy_a["id"], amount=350.0)
        client.patch(f"/claims/{claim['id']}?approved=true", headers=admin_headers)

        db_session.expire_all()
        policy = db_session.get(Policy, policy_a["id"])
        assert float(policy.claim_amount) == 350.0

    def test_reject_claim_transitions_policy_to_claim_rejected_in_db(
        self, client, headers_a, admin_headers, policy_a, db_session
    ):
        """Rejecting a claim must flip policy.status to claim_rejected in the DB."""
        claim = _submit_claim(client, headers_a, policy_a["id"])
        resp = client.patch(
            f"/claims/{claim['id']}?approved=false", headers=admin_headers
        )
        assert resp.status_code == 200

        db_session.expire_all()
        policy = db_session.get(Policy, policy_a["id"])
        assert policy.status == PolicyStatus.claim_rejected

    def test_full_claim_approval_lifecycle(self, client, headers_a, admin_headers):
        """End-to-end: create policy → submit claim → approve → verify API response."""
        policy = _create_policy(client, headers_a, coverage_amount=5_000.0)
        claim = _submit_claim(client, headers_a, policy["id"], amount=1_000.0)

        resp = client.patch(
            f"/claims/{claim['id']}?approved=true", headers=admin_headers
        )
        assert resp.status_code == 200
        assert resp.json()["approved"] is True

        pol_resp = client.get(f"/policies/{policy['id']}", headers=headers_a)
        assert pol_resp.json()["status"] == "claim_approved"

    def test_full_claim_rejection_lifecycle(self, client, headers_a, admin_headers):
        """End-to-end: create policy → submit claim → reject → verify API response."""
        policy = _create_policy(client, headers_a)
        claim = _submit_claim(client, headers_a, policy["id"])

        resp = client.patch(
            f"/claims/{claim['id']}?approved=false", headers=admin_headers
        )
        assert resp.status_code == 200
        assert resp.json()["approved"] is False

        pol_resp = client.get(f"/policies/{policy['id']}", headers=headers_a)
        assert pol_resp.json()["status"] == "claim_rejected"

    def test_get_claim_by_id_returns_correct_data(self, client, headers_a, policy_a):
        """GET /claims/{id} must return the claim's own data."""
        claim = _submit_claim(client, headers_a, policy_a["id"], amount=99.0)
        resp = client.get(f"/claims/{claim['id']}", headers=headers_a)
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == claim["id"]
        assert data["claim_amount"] == 99.0
        assert data["policy_id"] == policy_a["id"]

    def test_list_claims_returns_only_current_users_claims(
        self, client, headers_a, policy_a
    ):
        """GET /claims/ must return all claims submitted by the authenticated user."""
        _submit_claim(client, headers_a, policy_a["id"])
        resp = client.get("/claims/", headers=headers_a)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1

    def test_list_claims_filtered_by_policy_id(self, client, headers_a):
        """GET /claims/?policy_id=X must return claims for that policy only."""
        pol_1 = _create_policy(client, headers_a)
        pol_2 = _create_policy(client, headers_a)

        claim_1 = _submit_claim(client, headers_a, pol_1["id"])

        # Reset pol_1 status so we can submit another (edge-case workaround: the
        # factory sets status to active; here pol_1 is already claim_pending so
        # we target a fresh active policy).
        _submit_claim(client, headers_a, pol_2["id"])

        resp = client.get(f"/claims/?policy_id={pol_1['id']}", headers=headers_a)
        data = resp.json()
        assert data["total"] == 1
        assert data["claims"][0]["id"] == claim_1["id"]

    def test_list_claims_by_policy_endpoint(self, client, headers_a, policy_a):
        """GET /claims/policy/{id} must return claims linked to that policy."""
        claim = _submit_claim(client, headers_a, policy_a["id"])
        resp = client.get(f"/claims/policy/{policy_a['id']}", headers=headers_a)
        assert resp.status_code == 200
        ids = [c["id"] for c in resp.json()["claims"]]
        assert claim["id"] in ids

    def test_cannot_submit_claim_against_expired_policy(self, client, headers_a):
        """Claiming on a policy whose end_time is in the past must return 400."""
        # end_time = 2 is January 1970 — definitely in the past.
        expired_policy = _create_policy(client, headers_a, start_time=1, end_time=2)
        resp = client.post(
            "/claims/",
            headers=headers_a,
            json={
                "policy_id": expired_policy["id"],
                "claim_amount": 50.0,
                "proof": "Late claim on expired policy",
            },
        )
        assert resp.status_code == 400

    def test_cannot_submit_claim_against_cancelled_policy(self, client, headers_a):
        """Claiming on a cancelled policy must return 400."""
        policy = _create_policy(client, headers_a)
        client.delete(f"/policies/{policy['id']}", headers=headers_a)

        resp = client.post(
            "/claims/",
            headers=headers_a,
            json={
                "policy_id": policy["id"],
                "claim_amount": 50.0,
                "proof": "Claim on cancelled policy",
            },
        )
        assert resp.status_code == 400

    def test_cannot_claim_amount_over_remaining_coverage(self, client, headers_a):
        """A claim exceeding remaining coverage must return 400."""
        policy = _create_policy(client, headers_a, coverage_amount=100.0)
        resp = client.post(
            "/claims/",
            headers=headers_a,
            json={
                "policy_id": policy["id"],
                "claim_amount": 999.0,
                "proof": "Over-limit claim",
            },
        )
        assert resp.status_code == 400

    def test_claim_file_upload_creates_claim_row(
        self, client, headers_a, policy_a, db_session
    ):
        """POST /claims/upload with a valid image must persist a Claim row."""
        resp = client.post(
            "/claims/upload",
            headers=headers_a,
            data={"policy_id": str(policy_a["id"]), "claim_amount": "120.0"},
            files={"file": ("evidence.png", BytesIO(b"\x89PNG\r\n"), "image/png")},
        )
        assert resp.status_code == 201
        claim_id = resp.json()["id"]

        db_session.expire_all()
        assert db_session.get(Claim, claim_id) is not None

    def test_claim_file_upload_rejects_disallowed_file_type(
        self, client, headers_a, policy_a
    ):
        """Uploading a .txt file as proof must be rejected with 400."""
        resp = client.post(
            "/claims/upload",
            headers=headers_a,
            data={"policy_id": str(policy_a["id"]), "claim_amount": "100.0"},
            files={"file": ("note.txt", BytesIO(b"plain text"), "text/plain")},
        )
        assert resp.status_code == 400

    def test_claim_routes_require_authentication(self, client):
        """Claim endpoints must reject unauthenticated requests (401 or 403)."""
        status = client.get("/claims/").status_code
        assert status in (401, 403), f"Expected 401/403 for /claims/, got {status}"


# ===========================================================================
# 4. Database transaction tests
# ===========================================================================


class TestDatabaseTransactions:
    """Verify that multi-table writes are committed atomically.

    These tests query ``db_session`` *after* an API call has committed and check
    that every affected row reflects the new state — there must be no partial
    writes left visible.
    """

    def test_policy_creation_is_committed_immediately(
        self, client, headers_a, db_session
    ):
        """A newly created policy must be readable from the DB in the same session."""
        resp = client.post("/policies/", headers=headers_a, json=_policy_payload())
        pid = resp.json()["id"]

        db_session.expire_all()
        policy = db_session.get(Policy, pid)
        assert policy is not None
        assert policy.status == PolicyStatus.active

    def test_claim_submission_updates_both_claim_and_policy_atomically(
        self, client, headers_a, policy_a, db_session
    ):
        """POST /claims/ must persist both the Claim row and policy status in one commit."""
        claim = _submit_claim(client, headers_a, policy_a["id"], amount=75.0)

        db_session.expire_all()
        db_claim = db_session.get(Claim, claim["id"])
        db_policy = db_session.get(Policy, policy_a["id"])

        # Both must reflect the post-submit state — no partial write.
        assert db_claim is not None
        assert float(db_claim.claim_amount) == 75.0
        assert db_policy.status == PolicyStatus.claim_pending

    def test_claim_approval_updates_claim_and_policy_atomically(
        self, client, headers_a, admin_headers, policy_a, db_session
    ):
        """PATCH /claims/{id}?approved=true must update Claim and Policy together."""
        claim = _submit_claim(client, headers_a, policy_a["id"], amount=250.0)
        client.patch(f"/claims/{claim['id']}?approved=true", headers=admin_headers)

        db_session.expire_all()
        db_claim = db_session.get(Claim, claim["id"])
        db_policy = db_session.get(Policy, policy_a["id"])

        assert db_claim.approved is True
        assert db_policy.status == PolicyStatus.claim_approved
        assert float(db_policy.claim_amount) == 250.0

    def test_claim_rejection_updates_claim_and_policy_atomically(
        self, client, headers_a, admin_headers, policy_a, db_session
    ):
        """PATCH /claims/{id}?approved=false must update Claim and Policy together."""
        claim = _submit_claim(client, headers_a, policy_a["id"])
        client.patch(f"/claims/{claim['id']}?approved=false", headers=admin_headers)

        db_session.expire_all()
        db_claim = db_session.get(Claim, claim["id"])
        db_policy = db_session.get(Policy, policy_a["id"])

        assert db_claim.approved is False
        assert db_policy.status == PolicyStatus.claim_rejected

    def test_policy_cancellation_is_committed_to_database(
        self, client, headers_a, policy_a, db_session
    ):
        """DELETE /policies/{id} must persist status=cancelled to the DB."""
        client.delete(f"/policies/{policy_a['id']}", headers=headers_a)

        db_session.expire_all()
        policy = db_session.get(Policy, policy_a["id"])
        assert policy.status == PolicyStatus.cancelled

    def test_multiple_policies_created_in_sequence_all_persisted(
        self, client, headers_a, db_session
    ):
        """Creating several policies in a loop must produce distinct committed rows."""
        ids = [_create_policy(client, headers_a)["id"] for _ in range(5)]

        db_session.expire_all()
        for pid in ids:
            assert db_session.get(Policy, pid) is not None


# ===========================================================================
# 5. Multi-user isolation tests
# ===========================================================================


class TestMultiUserIsolation:
    """Row-level ownership: one user must not read or mutate another user's data."""

    def test_user_b_cannot_see_user_a_policies(
        self, client, headers_a, headers_b
    ):
        """GET /policies/ must return only the authenticated user's policies."""
        # User A creates a policy.
        pol_a = _create_policy(client, headers_a)

        # User B's list must not contain User A's policy ID.
        resp = client.get("/policies/", headers=headers_b)
        assert resp.status_code == 200
        b_ids = [p["id"] for p in resp.json()["policies"]]
        assert pol_a["id"] not in b_ids

    def test_user_b_cannot_get_user_a_policy_by_id(
        self, client, headers_a, headers_b, policy_a
    ):
        """GET /policies/{id} owned by User A must return 404 for User B."""
        resp = client.get(f"/policies/{policy_a['id']}", headers=headers_b)
        assert resp.status_code == 404

    def test_user_b_cannot_cancel_user_a_policy(
        self, client, headers_a, headers_b, policy_a
    ):
        """DELETE /policies/{id} owned by User A must return 404 for User B."""
        resp = client.delete(f"/policies/{policy_a['id']}", headers=headers_b)
        assert resp.status_code == 404

    def test_user_b_cannot_claim_against_user_a_policy(
        self, client, headers_a, headers_b, policy_a
    ):
        """POST /claims/ targeting User A's policy must be rejected for User B."""
        resp = client.post(
            "/claims/",
            headers=headers_b,
            json={
                "policy_id": policy_a["id"],
                "claim_amount": 100.0,
                "proof": "Cross-user claim attempt",
            },
        )
        assert resp.status_code == 404

    def test_user_b_cannot_see_user_a_claim(
        self, client, headers_a, headers_b, policy_a
    ):
        """GET /claims/{id} submitted by User A must return 404 for User B."""
        claim = _submit_claim(client, headers_a, policy_a["id"])
        resp = client.get(f"/claims/{claim['id']}", headers=headers_b)
        assert resp.status_code == 404

    def test_user_b_cannot_approve_user_a_claim(
        self, client, headers_a, headers_b, policy_a
    ):
        """Non-admin users must not be able to approve any claim (returns 403)."""
        claim = _submit_claim(client, headers_a, policy_a["id"])
        resp = client.patch(
            f"/claims/{claim['id']}?approved=true", headers=headers_b
        )
        assert resp.status_code == 403

    def test_each_user_sees_only_their_own_policies_in_list(
        self, client, headers_a, headers_b
    ):
        """Policy lists must be mutually exclusive between different users."""
        pol_a = _create_policy(client, headers_a, trigger_condition="user-A policy")
        pol_b = _create_policy(client, headers_b, trigger_condition="user-B policy")

        a_ids = [p["id"] for p in client.get("/policies/", headers=headers_a).json()["policies"]]
        b_ids = [p["id"] for p in client.get("/policies/", headers=headers_b).json()["policies"]]

        assert pol_a["id"] in a_ids
        assert pol_b["id"] not in a_ids
        assert pol_b["id"] in b_ids
        assert pol_a["id"] not in b_ids


# ===========================================================================
# 6. Webhook CRUD integration flow
# ===========================================================================


class TestWebhookFlow:
    """End-to-end webhook lifecycle: create → list → get → update → delete."""

    # Reusable payload helpers.
    _CREATE_PAYLOAD = {
        "url": "https://example.com/hooks/stellar",
        "event_types": ["policy.created", "claim.created"],
    }

    def test_create_webhook_persists_to_database(
        self, client, headers_a, db_session
    ):
        """POST /webhooks/ must create a Webhook row in the database."""
        resp = client.post("/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD)
        assert resp.status_code == 201

        wid = resp.json()["id"]
        db_session.expire_all()
        webhook = db_session.get(Webhook, wid)
        assert webhook is not None
        assert webhook.url == "https://example.com/hooks/stellar"
        assert webhook.is_active is True

    def test_create_list_get_full_webhook_lifecycle(self, client, headers_a):
        """Create a webhook, verify it appears in list, then fetch it directly."""
        created = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()

        # Must appear in list.
        list_resp = client.get("/webhooks/", headers=headers_a)
        assert list_resp.status_code == 200
        ids = [w["id"] for w in list_resp.json()]
        assert created["id"] in ids

        # Must be fetchable by ID.
        get_resp = client.get(f"/webhooks/{created['id']}", headers=headers_a)
        assert get_resp.status_code == 200
        assert get_resp.json()["url"] == self._CREATE_PAYLOAD["url"]

    def test_update_webhook_url_and_event_types(self, client, headers_a):
        """PATCH /webhooks/{id} must update url and event_types."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        updated = client.patch(
            f"/webhooks/{wid}",
            headers=headers_a,
            json={
                "url": "https://newdomain.com/hooks",
                "event_types": ["claim.approved"],
            },
        )
        assert updated.status_code == 200
        data = updated.json()
        assert data["url"] == "https://newdomain.com/hooks"
        assert data["event_types"] == ["claim.approved"]

    def test_deactivate_webhook_via_patch(self, client, headers_a):
        """PATCH /webhooks/{id} with is_active=false must deactivate the webhook."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        resp = client.patch(
            f"/webhooks/{wid}", headers=headers_a, json={"is_active": False}
        )
        assert resp.status_code == 200
        assert resp.json()["is_active"] is False

    def test_delete_webhook_removes_from_database(
        self, client, headers_a, db_session
    ):
        """DELETE /webhooks/{id} must remove the row from the DB."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        del_resp = client.delete(f"/webhooks/{wid}", headers=headers_a)
        assert del_resp.status_code == 200
        assert del_resp.json()["message"] == "Webhook deleted successfully"

        db_session.expire_all()
        assert db_session.get(Webhook, wid) is None

    def test_deleted_webhook_not_in_list(self, client, headers_a):
        """After deletion the webhook must no longer appear in GET /webhooks/."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        client.delete(f"/webhooks/{wid}", headers=headers_a)

        ids = [w["id"] for w in client.get("/webhooks/", headers=headers_a).json()]
        assert wid not in ids

    def test_webhook_scoped_to_owner_user_b_cannot_get(
        self, client, headers_a, headers_b
    ):
        """A webhook created by User A must not be accessible to User B."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        assert client.get(f"/webhooks/{wid}", headers=headers_b).status_code == 404

    def test_webhook_scoped_to_owner_user_b_cannot_delete(
        self, client, headers_a, headers_b
    ):
        """User B must not be able to delete User A's webhook."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        assert client.delete(f"/webhooks/{wid}", headers=headers_b).status_code == 404

    def test_webhook_rejects_invalid_event_types(self, client, headers_a):
        """Creating a webhook with an unknown event type must return 422."""
        resp = client.post(
            "/webhooks/",
            headers=headers_a,
            json={"url": "https://example.com/hook", "event_types": ["unknown.event"]},
        )
        assert resp.status_code == 422

    def test_webhook_deliveries_endpoint_returns_empty_list(self, client, headers_a):
        """GET /webhooks/{id}/deliveries must return an empty list for a new webhook."""
        wid = client.post(
            "/webhooks/", headers=headers_a, json=self._CREATE_PAYLOAD
        ).json()["id"]

        resp = client.get(f"/webhooks/{wid}/deliveries", headers=headers_a)
        assert resp.status_code == 200
        assert resp.json() == []


# ===========================================================================
# 7. Health & root endpoint smoke tests
# ===========================================================================


class TestApiHealth:
    """Sanity checks for root and health endpoints (no auth required)."""

    def test_root_endpoint_returns_welcome_message(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "message" in resp.json()

    def test_health_endpoint_returns_healthy(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"
