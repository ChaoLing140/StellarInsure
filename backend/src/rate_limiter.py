"""
Rate limiting middleware for StellarInsure API.
Uses slowapi for IP-based rate limiting with authenticated user bypass support.
"""
import logging
import re
import time
from typing import Optional

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

RATE_LIMIT_HEADER_NAMES = (
    "Retry-After",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
)


def _get_rate_limit_key(request: Request) -> str:
    if settings.rate_limit_auth_bypass:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer ") and len(auth_header) > 7:
            from .auth import verify_token
            token = auth_header[7:]
            payload = verify_token(token, token_type="access")
            if payload and payload.get("sub"):
                return f"user:{payload['sub']}"
    return get_remote_address(request)


def _parse_limit_value(limit_detail: str) -> int:
    match = re.match(r"(\d+)", limit_detail or "")
    return int(match.group(1)) if match else 60


def _parse_retry_after_seconds(limit_detail: str) -> int:
    detail = (limit_detail or "").lower()
    count_match = re.search(r"(\d+)\s*per", detail)
    window_match = re.search(r"per\s+(\d+)\s*(second|minute|hour|day)", detail)

    count = int(count_match.group(1)) if count_match else 60
    if not window_match:
        return max(count, 1)

    amount = int(window_match.group(1))
    unit = window_match.group(2)
    multipliers = {"second": 1, "minute": 60, "hour": 3600, "day": 86400}
    window_seconds = amount * multipliers.get(unit, 60)
    return max(window_seconds // max(count, 1), 1)


def build_rate_limit_headers(limit_detail: str, remaining: Optional[int] = None) -> dict[str, str]:
    limit_value = _parse_limit_value(limit_detail)
    retry_after = _parse_retry_after_seconds(limit_detail)
    reset_at = int(time.time()) + retry_after
    resolved_remaining = str(max(remaining, 0)) if remaining is not None else str(max(limit_value - 1, 0))

    return {
        "Retry-After": str(retry_after),
        "X-RateLimit-Limit": str(limit_value),
        "X-RateLimit-Remaining": resolved_remaining,
        "X-RateLimit-Reset": str(reset_at),
    }


limiter = Limiter(
    key_func=_get_rate_limit_key,
    default_limits=[settings.rate_limit_default],
    storage_uri=settings.redis_url if settings.redis_enabled else "memory://",
    headers_enabled=True,
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    limit_detail = str(exc.detail)
    headers = build_rate_limit_headers(limit_detail, remaining=0)
    retry_after = int(headers["Retry-After"])

    logger.warning(
        "Rate limit exceeded for %s on %s",
        _get_rate_limit_key(request),
        request.url.path,
    )

    return JSONResponse(
        status_code=429,
        content={
            "error_code": "RATE_001",
            "detail": f"Rate limit exceeded: {limit_detail}",
            "retry_after": retry_after,
        },
        headers=headers,
    )


class RateLimitHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if response.status_code == 429:
            return response

        limit_header = response.headers.get("X-RateLimit-Limit")
        if limit_header:
            for header_name in RATE_LIMIT_HEADER_NAMES:
                if header_name in response.headers:
                    continue
            if "X-RateLimit-Remaining" not in response.headers:
                response.headers["X-RateLimit-Remaining"] = str(max(_parse_limit_value(limit_header) - 1, 0))
            if "X-RateLimit-Reset" not in response.headers:
                retry_after = _parse_retry_after_seconds(settings.rate_limit_default)
                response.headers["X-RateLimit-Reset"] = str(int(time.time()) + retry_after)

        return response


def setup_rate_limiting(app):
    app.state.limiter = limiter
    app.add_middleware(RateLimitHeaderMiddleware)
    app.add_middleware(SlowAPIMiddleware)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    logger.info(
        "Rate limiting enabled: default=%s, auth=%s",
        settings.rate_limit_default,
        settings.rate_limit_auth,
    )
