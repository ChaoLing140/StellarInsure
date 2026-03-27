"""
Redis caching service for StellarInsure API.
Provides caching for frequently accessed data with graceful degradation on Redis failure.
"""
import json
import logging
from typing import Any, Optional, Callable
from functools import wraps
from .config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

_redis_client = None


def get_redis_client():
    """Get or create a Redis client with graceful failure handling."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if not settings.redis_enabled:
        return None
    try:
        import redis
        _redis_client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
        _redis_client.ping()
        logger.info("Redis connection established: %s", settings.redis_url.split("@")[-1])
        return _redis_client
    except Exception as e:
        logger.warning("Redis connection failed, caching disabled: %s", e)
        _redis_client = None
        return None


def cache_get(key: str) -> Optional[Any]:
    """Get a value from cache, returning None on miss or error."""
    client = get_redis_client()
    if client is None:
        return None
    try:
        data = client.get(key)
        if data is not None:
            logger.debug("Cache hit: %s", key)
            return json.loads(data)
        logger.debug("Cache miss: %s", key)
        return None
    except Exception as e:
        logger.warning("Cache get error for key %s: %s", key, e)
        return None


def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """Set a value in cache with optional TTL. Returns True on success."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        ttl = ttl or settings.redis_cache_ttl
        client.setex(key, ttl, json.dumps(value, default=str))
        logger.debug("Cache set: %s (ttl=%ds)", key, ttl)
        return True
    except Exception as e:
        logger.warning("Cache set error for key %s: %s", key, e)
        return False


def cache_delete(key: str) -> bool:
    """Delete a key from cache. Returns True on success."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        client.delete(key)
        logger.debug("Cache deleted: %s", key)
        return True
    except Exception as e:
        logger.warning("Cache delete error for key %s: %s", key, e)
        return False


def cache_delete_pattern(pattern: str) -> bool:
    """Delete all keys matching a pattern. Returns True on success."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        keys = client.keys(pattern)
        if keys:
            client.delete(*keys)
            logger.debug("Cache deleted %d keys matching: %s", len(keys), pattern)
        return True
    except Exception as e:
        logger.warning("Cache delete pattern error for %s: %s", pattern, e)
        return False


def invalidate_user_cache(user_id: int) -> None:
    """Invalidate all cached data for a specific user."""
    cache_delete(f"user:{user_id}")
    cache_delete_pattern(f"policies:user:{user_id}:*")


def invalidate_policy_cache(user_id: int) -> None:
    """Invalidate cached policy listings for a user."""
    cache_delete_pattern(f"policies:user:{user_id}:*")
