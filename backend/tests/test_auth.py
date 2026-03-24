"""Test authentication system for StellarInsure API"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestJWTTokenGeneration:
    """Test suite for JWT token generation"""

    def test_create_access_token(self):
        """Test access token creation"""
        from src.auth import create_access_token
        
        data = {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)

    def test_create_refresh_token(self):
        """Test refresh token creation"""
        from src.auth import create_refresh_token
        
        data = {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        token = create_refresh_token(data)
        
        assert token is not None
        assert isinstance(token, str)

    def test_decode_valid_token(self):
        """Test decoding a valid token"""
        from src.auth import create_access_token, decode_token
        
        data = {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        token = create_access_token(data)
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == "1"
        assert payload["stellar_address"] == "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"

    def test_decode_invalid_token(self):
        """Test decoding an invalid token"""
        from src.auth import decode_token
        
        payload = decode_token("invalid_token")
        
        assert payload is None

    def test_verify_access_token(self):
        """Test verifying an access token"""
        from src.auth import create_access_token, verify_token
        
        data = {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        token = create_access_token(data)
        payload = verify_token(token, token_type="access")
        
        assert payload is not None
        assert payload["type"] == "access"

    def test_verify_token_wrong_type(self):
        """Test verifying a token with wrong type"""
        from src.auth import create_access_token, verify_token
        
        data = {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        token = create_access_token(data)
        payload = verify_token(token, token_type="refresh")
        
        assert payload is None

    def test_create_tokens_helper(self):
        """Test create_tokens helper function"""
        from src.auth import create_tokens
        
        tokens = create_tokens(1, "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS")
        
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["token_type"] == "bearer"


class TestAuthRoutes:
    """Test suite for authentication routes"""

    def test_login_with_valid_signature(self):
        """Test login with valid wallet signature"""
        from src.main import app
        
        client = TestClient(app)
        
        response = client.post(
            "/auth/login",
            json={
                "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS",
                "signature": "test_signature",
                "message": "StellarInsure Authentication 2026-03-24"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_with_invalid_stellar_address(self):
        """Test login with invalid Stellar address"""
        from src.main import app
        
        client = TestClient(app)
        
        response = client.post(
            "/auth/login",
            json={
                "stellar_address": "INVALID",
                "signature": "test_signature",
                "message": "test_message"
            }
        )
        
        assert response.status_code == 401

    def test_register_new_user(self):
        """Test registering a new user"""
        from src.main import app
        
        client = TestClient(app)
        
        response = client.post(
            "/auth/register",
            json={
                "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS",
                "signature": "test_signature",
                "message": "StellarInsure Authentication 2026-03-24"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_register_existing_user(self):
        """Test registering an existing user"""
        from src.main import app
        
        client = TestClient(app)
        
        client.post(
            "/auth/login",
            json={
                "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS",
                "signature": "test_signature",
                "message": "StellarInsure Authentication 2026-03-24"
            }
        )
        
        response = client.post(
            "/auth/register",
            json={
                "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS",
                "signature": "test_signature",
                "message": "StellarInsure Authentication 2026-03-24"
            }
        )
        
        assert response.status_code == 400

    def test_refresh_token(self):
        """Test refreshing tokens"""
        from src.main import app
        from src.auth import create_refresh_token
        
        client = TestClient(app)
        
        refresh_token = create_refresh_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self):
        """Test refreshing with invalid token"""
        from src.main import app
        
        client = TestClient(app)
        
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )
        
        assert response.status_code == 401

    def test_get_current_user(self):
        """Test getting current user info"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200

    def test_get_current_user_unauthorized(self):
        """Test getting current user without token"""
        from src.main import app
        
        client = TestClient(app)
        
        response = client.get("/auth/me")
        
        assert response.status_code == 403

    def test_logout(self):
        """Test logout endpoint"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"


class TestTokenExpiration:
    """Test suite for token expiration"""

    def test_access_token_expiration_config(self):
        """Test access token expiration is configured"""
        from src.config import get_settings
        
        settings = get_settings()
        
        assert settings.jwt_access_token_expire_minutes > 0
        assert settings.jwt_refresh_token_expire_days > 0

    def test_token_contains_expiry(self):
        """Test that tokens contain expiry information"""
        from src.auth import create_access_token, decode_token
        
        data = {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        token = create_access_token(data)
        payload = decode_token(token)
        
        assert "exp" in payload
        exp_time = datetime.fromtimestamp(payload["exp"])
        assert exp_time > datetime.utcnow()


class TestWalletSignatureVerification:
    """Test suite for wallet signature verification"""

    def test_stellar_address_format_validation(self):
        """Test Stellar address format validation"""
        from src.routes.auth import verify_stellar_signature
        
        valid_address = "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"
        assert verify_stellar_signature(valid_address, "sig", "msg") is not None
        
        invalid_address = "INVALID"
        result = verify_stellar_signature(invalid_address, "sig", "msg")
        assert result is False

    def test_stellar_address_length(self):
        """Test Stellar address length validation"""
        from src.routes.auth import verify_stellar_signature
        
        short_address = "GABC"
        result = verify_stellar_signature(short_address, "sig", "msg")
        assert result is False
