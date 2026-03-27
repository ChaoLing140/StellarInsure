"""
Rate limiting middleware for StellarInsure API.
Uses slowapi for IP-based rate limiting with authenticated user bypass support.
"""
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from .config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


def _get_rate_limit_key(request: Request) -> str:
    """
    Determine rate limit key based on request.
    If authenticated user bypass is enabled and a valid Bearer token is present,
    return a user-specific key that receives higher limits.
    Otherwise, fall back to IP-based limiting.
    """
    if settings.rate_limit_auth_bypass:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer ") and len(auth_header) > 7:
            from .auth import verify_token
            token = auth_header[7:]
            payload = verify_token(token, token_type="access")
            if payload and payload.get("sub"):
                return f"user:{payload['sub']}"
    return get_remote_address(request)


limiter = Limiter(
    key_func=_get_rate_limit_key,
    default_limits=[settings.rate_limit_default],
    storage_uri=settings.redis_url if settings.redis_enabled else "memory://",
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Handle rate limit exceeded errors with proper retry information."""
    retry_after = exc.detail.split("per")[-1].strip() if "per" in exc.detail else "60"
    logger.warning("Rate limit exceeded for %s on %s", _get_rate_limit_key(request), request.url.path)
    return JSONResponse(
        status_code=429,
        content={
            "error_code": "RATE_001",
            "detail": f"Rate limit exceeded: {exc.detail}",
            "retry_after": retry_after,
        },
        headers={
            "Retry-After": retry_after,
            "X-RateLimit-Limit": str(exc.detail),
        },
    )


def setup_rate_limiting(app):
    """Attach rate limiter and exception handler to the FastAPI app."""
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    logger.info("Rate limiting enabled: default=%s, auth=%s", settings.rate_limit_default, settings.rate_limit_auth)
