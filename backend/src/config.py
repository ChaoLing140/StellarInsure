import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    environment: str = "development"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    stellar_network_passphrase: str = "Test SDF Network ; September 2015"
    stellar_horizon_url: str = "https://horizon-testnet.stellar.org"
    stellar_contract_id: Optional[str] = None
    stellar_admin_secret: Optional[str] = None
    stellar_admin_public: Optional[str] = None

    database_url: str = "postgresql://postgres:postgres@localhost:5432/stellarinsure"
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_timeout: int = 30
    db_pool_recycle: int = 3600
    db_pool_pre_ping: bool = True
    db_echo: bool = False

    @property
    def allowed_origins(self) -> List[str]:
        if self.environment == "production":
            origins = os.getenv("CORS_ORIGINS", "")
            return [origin.strip() for origin in origins.split(",") if origin.strip()]
        else:
            return [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
            ]

    @property
    def is_testnet(self) -> bool:
        return "testnet" in self.stellar_horizon_url.lower() or "test" in self.stellar_network_passphrase.lower()

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
