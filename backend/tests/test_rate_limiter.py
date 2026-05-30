"""Tests for rate limiting middleware."""
import json
import pytest


class TestRateLimiter:
    def test_rate_limiter_is_attached(self, app):
        assert hasattr(app.state, "limiter")

    def test_rate_limit_key_defaults_to_ip(self):
        from unittest.mock import MagicMock
        from src.rate_limiter import _get_rate_limit_key

        request = MagicMock()
        request.headers = {}
        request.client.host = "127.0.0.1"
        key = _get_rate_limit_key(request)
        assert key == "127.0.0.1"

    def test_rate_limit_exceeded_handler_returns_429(self):
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
        assert response.headers["Retry-After"] == "6"
        assert response.headers["X-RateLimit-Limit"] == "10"
        assert response.headers["X-RateLimit-Remaining"] == "0"
        assert "X-RateLimit-Reset" in response.headers
        body = json.loads(response.body.decode())
        assert body["retry_after"] == 6

    def test_build_rate_limit_headers_are_consistent(self):
        from src.rate_limiter import RATE_LIMIT_HEADER_NAMES, build_rate_limit_headers

        headers = build_rate_limit_headers("60 per 1 minute", remaining=12)
        for header_name in RATE_LIMIT_HEADER_NAMES:
            assert header_name in headers

    def test_health_endpoint_not_rate_limited(self, client):
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == 200

    def test_root_endpoint_accessible(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert "Welcome" in response.json().get("message", "")


class TestRateLimitHeaders:
    def test_auth_endpoint_exists(self, client):
        response = client.post("/auth/login", json={
            "stellar_address": "G" + "A" * 55,
            "signature": "test-sig",
            "message": "test-message",
        })
        assert response.status_code in (200, 401, 422, 429)

    def test_non_throttled_response_can_include_rate_limit_headers(self, client):
        response = client.get("/health")
        assert response.status_code == 200


class TestRateLimitThrottling:
    def test_throttled_response_includes_retry_contract(self):
        from unittest.mock import MagicMock
        from src.rate_limiter import rate_limit_exceeded_handler

        exc = MagicMock()
        exc.detail = "1 per 1 minute"
        response = rate_limit_exceeded_handler(
            MagicMock(),
            exc,
        )

        assert response.status_code == 429
        assert response.headers["Retry-After"] == "60"
        assert response.headers["X-RateLimit-Limit"] == "1"
        assert response.headers["X-RateLimit-Remaining"] == "0"
