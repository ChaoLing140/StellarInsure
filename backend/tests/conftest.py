import os
from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["REDIS_ENABLED"] = "false"

from src.auth import create_access_token, create_refresh_token
from src.database import get_db
from src.models import Base, Claim, Policy, PolicyStatus, PolicyType, User


@pytest.fixture(scope="session")
def engine():
    return create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


@pytest.fixture(scope="session")
def session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session(engine, session_factory):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def app(db_session, tmp_path, monkeypatch):
    from src.main import app as fastapi_app
    from src.services.storage_service import storage_service

    upload_dir = tmp_path / "uploads" / "claim_proofs"
    upload_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(storage_service, "upload_dir", str(upload_dir))

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    yield fastapi_app
    fastapi_app.dependency_overrides.clear()


@pytest.fixture()
def client(app):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def wallet_address():
    return "G" + ("A" * 55)


@pytest.fixture()
def second_wallet_address():
    return "G" + ("B" * 55)


@pytest.fixture()
def auth_message():
    return f"StellarInsure Authentication {datetime.utcnow().strftime('%Y-%m-%d')}"


@pytest.fixture()
def user_factory(db_session):
    def create_user(stellar_address, email=None):
        user = User(stellar_address=stellar_address, email=email)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return create_user


@pytest.fixture()
def auth_user(user_factory, wallet_address):
    return user_factory(wallet_address)


@pytest.fixture()
def auth_headers(auth_user):
    token = create_access_token(
        {"sub": str(auth_user.id), "stellar_address": auth_user.stellar_address}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def refresh_token(auth_user):
    return create_refresh_token(
        {"sub": str(auth_user.id), "stellar_address": auth_user.stellar_address}
    )


@pytest.fixture()
def policy_factory(db_session):
    def create_policy(user, **overrides):
        now = int(datetime.utcnow().timestamp())
        policy = Policy(
            policyholder_id=user.id,
            policy_type=overrides.get("policy_type", PolicyType.weather),
            coverage_amount=overrides.get("coverage_amount", 1000.0),
            premium=overrides.get("premium", 50.0),
            start_time=overrides.get("start_time", now),
            end_time=overrides.get("end_time", now + 86400),
            trigger_condition=overrides.get(
                "trigger_condition", "Rainfall below threshold"
            ),
            status=overrides.get("status", PolicyStatus.active),
            claim_amount=overrides.get("claim_amount", 0),
        )
        db_session.add(policy)
        db_session.commit()
        db_session.refresh(policy)
        return policy

    return create_policy


@pytest.fixture()
def claim_factory(db_session):
    def create_claim(user, policy, **overrides):
        claim = Claim(
            policy_id=policy.id,
            claimant_id=user.id,
            claim_amount=overrides.get("claim_amount", 100.0),
            proof=overrides.get("proof", "Weather report evidence"),
            timestamp=overrides.get("timestamp", int(datetime.utcnow().timestamp())),
            approved=overrides.get("approved", False),
        )
        db_session.add(claim)
        db_session.commit()
        db_session.refresh(claim)
        return claim

    return create_claim
