from src.auth import create_access_token, create_refresh_token, create_tokens, decode_token, verify_token
from src.models import User


def test_login_creates_user_and_returns_tokens(client, wallet_address, auth_message, db_session):
    response = client.post(
        "/auth/login",
        json={
            "stellar_address": wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data
    assert "refresh_token" in data
    assert db_session.query(User).count() == 1


def test_register_rejects_existing_user(
    client, user_factory, wallet_address, auth_message
):
    user_factory(wallet_address)

    response = client.post(
        "/auth/register",
        json={
            "stellar_address": wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "User already exists. Please login instead."


def test_refresh_returns_new_access_token(client, refresh_token):
    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})

    assert response.status_code == 200
    payload = decode_token(response.json()["access_token"])
    assert payload["type"] == "access"


def test_refresh_rejects_invalid_token(client):
    response = client.post("/auth/refresh", json={"refresh_token": "invalid"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid refresh token"


def test_me_returns_current_user(client, auth_headers, wallet_address):
    response = client.get("/auth/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["stellar_address"] == wallet_address


def test_update_me_rejects_duplicate_email(
    client, user_factory, wallet_address, second_wallet_address
):
    primary = user_factory(wallet_address)
    user_factory(second_wallet_address, email="taken@example.com")
    token = create_access_token(
        {"sub": str(primary.id), "stellar_address": primary.stellar_address}
    )

    response = client.patch(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "taken@example.com"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already in use"


def test_logout_returns_success_message(client, auth_headers):
    response = client.post("/auth/logout", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"


def test_delete_account_soft_deletes_and_anonymizes(
    client, auth_headers, auth_user, wallet_address, auth_message, db_session
):
    response = client.delete(
        "/auth/me",
        headers=auth_headers,
        json={
            "stellar_address": wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Account deleted successfully"
    db_session.refresh(auth_user)
    assert auth_user.deleted_at is not None
    assert auth_user.email is None
    assert auth_user.stellar_address == f"DELETED_{auth_user.id}"


def test_delete_account_cancels_active_policies(
    client, auth_headers, auth_user, wallet_address, auth_message, policy_factory, db_session
):
    from src.models import PolicyStatus
    policy = policy_factory(auth_user, status=PolicyStatus.active)

    client.delete(
        "/auth/me",
        headers=auth_headers,
        json={
            "stellar_address": wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )

    db_session.refresh(policy)
    assert policy.status == PolicyStatus.cancelled


def test_delete_account_rejects_pending_claims(
    client, auth_headers, auth_user, wallet_address, auth_message, policy_factory, db_session
):
    from src.models import PolicyStatus
    policy = policy_factory(auth_user, status=PolicyStatus.claim_pending)

    client.delete(
        "/auth/me",
        headers=auth_headers,
        json={
            "stellar_address": wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )

    db_session.refresh(policy)
    assert policy.status == PolicyStatus.claim_rejected


def test_delete_account_rejects_address_mismatch(
    client, auth_headers, second_wallet_address, auth_message
):
    response = client.delete(
        "/auth/me",
        headers=auth_headers,
        json={
            "stellar_address": second_wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )
    assert response.status_code == 401


def test_deleted_user_cannot_authenticate(
    client, auth_headers, auth_user, wallet_address, auth_message
):
    client.delete(
        "/auth/me",
        headers=auth_headers,
        json={
            "stellar_address": wallet_address,
            "signature": "signed",
            "message": auth_message,
        },
    )

    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 401


def test_token_helpers_round_trip(wallet_address):
    access_token = create_access_token({"sub": "1", "stellar_address": wallet_address})
    refresh_token = create_refresh_token({"sub": "1", "stellar_address": wallet_address})
    bundle = create_tokens(1, wallet_address)

    assert verify_token(access_token, token_type="access")["stellar_address"] == wallet_address
    assert verify_token(refresh_token, token_type="refresh")["type"] == "refresh"
    assert set(bundle) == {"access_token", "refresh_token", "token_type"}
