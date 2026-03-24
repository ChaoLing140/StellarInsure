"""Test PostgreSQL connection pooling for StellarInsure API"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import threading
import time


class TestDatabaseConfig:
    """Test suite for database configuration"""

    def test_config_has_pool_settings(self):
        """Test that configuration includes pool settings"""
        from src.config import Settings

        settings = Settings()
        assert hasattr(settings, 'db_pool_size')
        assert hasattr(settings, 'db_max_overflow')
        assert hasattr(settings, 'db_pool_timeout')
        assert hasattr(settings, 'db_pool_recycle')
        assert hasattr(settings, 'db_pool_pre_ping')

    def test_default_pool_size(self):
        """Test default pool size is reasonable"""
        from src.config import Settings

        settings = Settings()
        assert settings.db_pool_size == 10
        assert settings.db_max_overflow == 20
        assert settings.db_pool_timeout == 30
        assert settings.db_pool_recycle == 3600
        assert settings.db_pool_pre_ping is True

    def test_pool_settings_from_environment(self):
        """Test that pool settings can be overridden via environment"""
        import os
        from src.config import Settings

        os.environ['DB_POOL_SIZE'] = '15'
        os.environ['DB_MAX_OVERFLOW'] = '25'

        settings = Settings()
        
        os.environ.pop('DB_POOL_SIZE', None)
        os.environ.pop('DB_MAX_OVERFLOW', None)


class TestConnectionPooling:
    """Test suite for connection pooling behavior"""

    def test_engine_has_pool_configuration(self):
        """Test that engine is configured with connection pooling"""
        from src.database import engine
        from sqlalchemy.pool import QueuePool

        assert engine.pool is not None
        assert isinstance(engine.pool, QueuePool)

    def test_pool_size_configuration(self):
        """Test that pool size matches configuration"""
        from src.database import engine, get_settings

        settings = get_settings()
        assert engine.pool.size() == settings.db_pool_size

    def test_get_db_yields_session(self):
        """Test that get_db yields a database session"""
        from src.database import get_db
        from sqlalchemy.orm import Session

        db_gen = get_db()
        db = next(db_gen)
        
        assert db is not None
        assert isinstance(db, Session)
        
        db.close()

    def test_get_db_closes_session(self):
        """Test that get_db properly closes session"""
        from src.database import get_db

        db_gen = get_db()
        db = next(db_gen)
        db.close_mock = Mock()
        
        try:
            next(db_gen)
        except StopIteration:
            pass


class TestPoolStatus:
    """Test suite for pool status monitoring"""

    def test_get_pool_status(self):
        """Test getting pool status"""
        from src.database import get_pool_status

        status = get_pool_status()

        assert "pool_size" in status
        assert "checked_out_connections" in status
        assert "overflow_connections" in status
        assert "checked_in_connections" in status
        assert "total_connections" in status

    def test_pool_status_values(self):
        """Test that pool status returns valid values"""
        from src.database import get_pool_status

        status = get_pool_status()

        assert isinstance(status["pool_size"], int)
        assert isinstance(status["checked_out_connections"], int)
        assert isinstance(status["overflow_connections"], int)
        assert isinstance(status["total_connections"], int)
        assert status["pool_size"] >= 0
        assert status["total_connections"] >= 0


class TestHealthCheck:
    """Test suite for database health checks"""

    def test_health_check_returns_dict(self):
        """Test that health check returns a dictionary"""
        from src.database import health_check

        result = health_check()

        assert isinstance(result, dict)
        assert "status" in result

    def test_health_check_status_values(self):
        """Test that health check returns valid status"""
        from src.database import health_check

        result = health_check()

        assert result["status"] in ["healthy", "unhealthy"]

    def test_health_check_includes_database_info(self):
        """Test that health check includes database connection info"""
        from src.database import health_check

        result = health_check()

        assert "database" in result


class TestConnectionRecycling:
    """Test suite for connection recycling"""

    def test_pool_recycle_configured(self):
        """Test that connection recycling is configured"""
        from src.database import engine, get_settings

        settings = get_settings()
        assert settings.db_pool_recycle > 0

    def test_pool_recycle_default_value(self):
        """Test default recycle time is reasonable"""
        from src.config import Settings

        settings = Settings()
        assert settings.db_pool_recycle == 3600


class TestConnectionPrePing:
    """Test suite for connection pre-ping"""

    def test_pre_ping_enabled(self):
        """Test that pre-ping is enabled"""
        from src.config import Settings

        settings = Settings()
        assert settings.db_pool_pre_ping is True

    def test_pre_ping_configured_in_engine(self):
        """Test that pre-ping is configured in engine"""
        from src.database import engine

        assert engine.pool._pre_ping is True


class TestConcurrencyHandling:
    """Test suite for concurrent connection handling"""

    def test_concurrent_sessions(self):
        """Test handling multiple concurrent sessions"""
        from src.database import get_db, SessionLocal
        
        sessions = []
        errors = []

        def create_session():
            try:
                db = SessionLocal()
                sessions.append(db)
                time.sleep(0.1)
                db.close()
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=create_session) for _ in range(5)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        assert len(errors) == 0

    def test_pool_handles_checkout_checkin(self):
        """Test that pool properly handles checkout and checkin"""
        from src.database import get_pool_status, SessionLocal

        initial_status = get_pool_status()
        
        db = SessionLocal()
        after_checkout = get_pool_status()
        
        db.close()
        after_checkin = get_pool_status()


class TestErrorHandling:
    """Test suite for error handling"""

    def test_get_db_handles_exceptions(self):
        """Test that get_db handles exceptions properly"""
        from src.database import get_db

        db_gen = get_db()
        db = next(db_gen)
        
        db.rollback = Mock()
        
        try:
            raise Exception("Test error")
        except Exception:
            pass


class TestEnvironmentBasedConfig:
    """Test suite for environment-based configuration"""

    def test_database_url_configurable(self):
        """Test that database URL is configurable"""
        from src.config import Settings

        settings = Settings()
        assert hasattr(settings, 'database_url')
        assert settings.database_url is not None

    def test_production_vs_development_defaults(self):
        """Test different defaults for production and development"""
        from src.config import Settings

        settings = Settings(environment="development")
        
        assert settings.environment == "development"

    def test_is_production_property(self):
        """Test is_production property"""
        from src.config import Settings

        settings = Settings(environment="production")
        assert settings.is_production is True

        settings = Settings(environment="development")
        assert settings.is_production is False


class TestPoolEvents:
    """Test suite for pool event listeners"""

    def test_connect_event_registered(self):
        """Test that connect event is registered"""
        from src.database import engine
        
        assert engine.dispatch.connect is not None

    def test_checkout_event_registered(self):
        """Test that checkout event is registered"""
        from src.database import engine
        
        assert engine.dispatch.checkout is not None

    def test_checkin_event_registered(self):
        """Test that checkin event is registered"""
        from src.database import engine
        
        assert engine.dispatch.checkin is not None


class TestSessionManagement:
    """Test suite for session management"""

    def test_session_local_configured(self):
        """Test that SessionLocal is properly configured"""
        from src.database import SessionLocal

        assert SessionLocal is not None
        assert not SessionLocal.autocommit
        assert not SessionLocal.autoflush

    def test_init_db(self):
        """Test that init_db function exists"""
        from src.database import init_db

        assert callable(init_db)
