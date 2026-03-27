"""Tests for environment configuration management (Issue #48)."""
import os

import pytest


class TestSettingsValidation:
    """Test that settings are validated on startup."""

    def test_settings_load_in_test_environment(self):
        from src.config import Settings
        s = Settings(environment="test", database_url="sqlite://", jwt_secret_key="k")
        assert s.environment == "test"

    def test_settings_reject_invalid_environment(self):
        from src.config import Settings
        with pytest.raises(Exception):
            Settings(environment="invalid_env", database_url="sqlite://", jwt_secret_key="k")

    def test_settings_reject_invalid_log_level(self):
        from src.config import Settings
        with pytest.raises(Exception):
            Settings(log_level="INVALID", database_url="sqlite://", jwt_secret_key="k")

    def test_allowed_origins_development(self):
        from src.config import Settings
        s = Settings(environment="development", database_url="sqlite://", jwt_secret_key="k")
        assert "http://localhost:3000" in s.allowed_origins

    def test_is_production_flag(self):
        from src.config import Settings
        s = Settings(environment="production", database_url="sqlite://", jwt_secret_key="k")
        assert s.is_production is True

    def test_is_testnet_flag(self):
        from src.config import Settings
        s = Settings(
            stellar_horizon_url="https://horizon-testnet.stellar.org",
            database_url="sqlite://",
            jwt_secret_key="k",
        )
        assert s.is_testnet is True

    def test_redis_settings_defaults(self, monkeypatch):
        monkeypatch.delenv("REDIS_ENABLED", raising=False)
        from src.config import Settings
        s = Settings(database_url="sqlite://", jwt_secret_key="k")
        assert s.redis_url == "redis://localhost:6379/0"
        assert s.redis_cache_ttl == 300
        assert s.redis_enabled is True

    def test_rate_limit_settings_defaults(self):
        from src.config import Settings
        s = Settings(database_url="sqlite://", jwt_secret_key="k")
        assert s.rate_limit_default == "60/minute"
        assert s.rate_limit_auth == "10/minute"
        assert s.rate_limit_auth_bypass is False

    def test_webhook_settings_defaults(self):
        from src.config import Settings
        s = Settings(database_url="sqlite://", jwt_secret_key="k")
        assert s.webhook_max_retries == 3
        assert s.webhook_delivery_timeout == 30


class TestSecretsNotLogged:
    """Test that sensitive fields are redacted in logs."""

    def test_sensitive_fields_are_defined(self):
        from src.config import _SENSITIVE_FIELDS
        assert "jwt_secret_key" in _SENSITIVE_FIELDS
        assert "stellar_admin_secret" in _SENSITIVE_FIELDS
        assert "database_url" in _SENSITIVE_FIELDS
        assert "redis_url" in _SENSITIVE_FIELDS
        assert "webhook_secret_key" in _SENSITIVE_FIELDS
        assert "storage_secret_key" in _SENSITIVE_FIELDS

    def test_log_settings_redacts_secrets(self, caplog):
        import logging
        from src.config import Settings
        s = Settings(
            database_url="sqlite://",
            jwt_secret_key="super-secret-key",
        )
        with caplog.at_level(logging.INFO, logger="src.config"):
            s.log_settings()
        log_text = caplog.text
        assert "super-secret-key" not in log_text
        assert "REDACTED" in log_text


class TestEnvExampleFile:
    """Test that .env.example file documents all required settings."""

    def test_env_example_exists(self):
        env_path = os.path.join(
            os.path.dirname(__file__), "..", ".env.example"
        )
        assert os.path.exists(env_path), ".env.example file should exist"

    def test_env_example_has_required_vars(self):
        env_path = os.path.join(
            os.path.dirname(__file__), "..", ".env.example"
        )
        with open(env_path) as f:
            content = f.read()

        required_vars = [
            "ENVIRONMENT",
            "JWT_SECRET_KEY",
            "DATABASE_URL",
            "STELLAR_HORIZON_URL",
            "REDIS_URL",
            "RATE_LIMIT_DEFAULT",
            "WEBHOOK_SECRET_KEY",
            "STORAGE_SECRET_KEY",
            "LOG_LEVEL",
        ]
        for var in required_vars:
            assert var in content, f".env.example should document {var}"
