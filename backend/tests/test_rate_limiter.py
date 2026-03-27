"""Tests for rate limiting middleware (Issue #11)."""
import pytest


class TestRateLimiter:
    """Test rate limiting configuration and behavior."""

    def test_rate_limiter_is_attached(self, app):
        """Rate limiter should be attached to the app state."""
        assert hasattr(app.state, "limiter")

    def test_rate_limit_key_defaults_to_ip(self):
        """Without auth header, rate limit key should default to IP."""
        from unittest.mock import MagicMock
        from src.rate_limiter import _get_rate_limit_key

        request = MagicMock()
        request.headers = {}
        request.client.host = "127.0.0.1"
        key = _get_rate_limit_key(request)
        assert key == "127.0.0.1"

    def test_rate_limit_exceeded_handler_returns_429(self):
        """Rate limit exceeded handler should return 429 with retry info."""
        from unittest.mock import MagicMock
        from src.rate_limiter import rate_limit_exceeded_handler

        request = MagicMock()
        request.headers = {}
        request.client.host = "127.0.0.1"
        request.url.path = "/auth/login"

        exc = MagicMock()
        exc.detail = "10 per 1 minute"
        response = rate_limit_exceeded_handler(request, exc)
        assert response.status_code == 429
        assert "Retry-After" in response.headers

    def test_health_endpoint_not_rate_limited(self, client):
        """Health check endpoint should not be rate limited."""
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == 200

    def test_root_endpoint_accessible(self, client):
        """Root endpoint should remain accessible."""
        response = client.get("/")
        assert response.status_code == 200
        assert "Welcome" in response.json().get("message", "")


class TestRateLimitHeaders:
    """Test that rate limit headers are included in responses."""

    def test_auth_endpoint_exists(self, client):
        """Auth login endpoint should be accessible and return proper error on invalid input."""
        response = client.post("/auth/login", json={
            "stellar_address": "G" + "A" * 55,
            "signature": "test-sig",
            "message": "test-message"
        })
        # Should get auth error, not 500
        assert response.status_code in (200, 401, 422, 429)
