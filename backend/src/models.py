from datetime import datetime
from sqlalchemy import Column, Integer, String, BigInteger, Boolean, DateTime, Enum, Numeric, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class PolicyType(enum.Enum):
    weather = "weather"
    smart_contract = "smart_contract"
    flight = "flight"
    health = "health"
    asset = "asset"


class PolicyStatus(enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"
    claim_pending = "claim_pending"
    claim_approved = "claim_approved"
    claim_rejected = "claim_rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    stellar_address = Column(String(56), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True, default=None)

    policies = relationship("Policy", back_populates="policyholder", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="claimant", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, stellar_address='{self.stellar_address}')>"


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    policyholder_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    policy_type = Column(Enum(PolicyType), nullable=False)
    coverage_amount = Column(Numeric(precision=20, scale=7), nullable=False)
    premium = Column(Numeric(precision=20, scale=7), nullable=False)
    start_time = Column(BigInteger, nullable=False)
    end_time = Column(BigInteger, nullable=False)
    trigger_condition = Column(String(500), nullable=False)
    status = Column(Enum(PolicyStatus), default=PolicyStatus.active, nullable=False, index=True)
    claim_amount = Column(Numeric(precision=20, scale=7), default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    policyholder = relationship("User", back_populates="policies")
    claims = relationship("Claim", back_populates="policy", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="policy", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        kwargs.setdefault("status", PolicyStatus.active)
        kwargs.setdefault("claim_amount", 0)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"<Policy(id={self.id}, type='{self.policy_type.value}', status='{self.status.value}')>"

    def is_expired(self, current_time: int) -> bool:
        return current_time > self.end_time

    def is_active(self) -> bool:
        return self.status == PolicyStatus.active

    def can_claim(self, current_time: int) -> bool:
        return self.is_active() and not self.is_expired(current_time)

    def remaining_coverage(self):
        return self.coverage_amount - self.claim_amount


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False, index=True)
    claimant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    claim_amount = Column(Numeric(precision=20, scale=7), nullable=False)
    proof = Column(String(1000), nullable=False)
    timestamp = Column(BigInteger, nullable=False)
    approved = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    policy = relationship("Policy", back_populates="claims")
    claimant = relationship("User", back_populates="claims")
    transactions = relationship("Transaction", back_populates="claim", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        kwargs.setdefault("approved", False)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"<Claim(id={self.id}, policy_id={self.policy_id}, approved={self.approved})>"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=True, index=True)
    transaction_hash = Column(String(64), unique=True, nullable=False, index=True)
    amount = Column(Numeric(precision=20, scale=7), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    status = Column(String(50), default="pending", nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="transactions")
    policy = relationship("Policy", back_populates="transactions")
    claim = relationship("Claim", back_populates="transactions")

    def __init__(self, **kwargs):
        kwargs.setdefault("status", "pending")
        super().__init__(**kwargs)

    def __repr__(self):
        return f"<Transaction(id={self.id}, type='{self.transaction_type}', status='{self.status}')>"


class WebhookEventType(enum.Enum):
    policy_created = "policy.created"
    policy_cancelled = "policy.cancelled"
    claim_created = "claim.created"
    claim_approved = "claim.approved"
    claim_rejected = "claim.rejected"


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    url = Column(String(2048), nullable=False)
    secret = Column(String(256), nullable=False)
    event_types = Column(Text, nullable=False)  # comma-separated event types
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="webhooks")
    deliveries = relationship("WebhookDelivery", back_populates="webhook", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        kwargs.setdefault("is_active", True)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"<Webhook(id={self.id}, url='{self.url}', active={self.is_active})>"

    def get_event_types(self) -> list:
        return [e.strip() for e in self.event_types.split(",") if e.strip()]

    def subscribes_to(self, event_type: str) -> bool:
        return event_type in self.get_event_types()


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    webhook_id = Column(Integer, ForeignKey("webhooks.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=False)
    response_status = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    success = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    last_attempt_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    webhook = relationship("Webhook", back_populates="deliveries")

    def __init__(self, **kwargs):
        kwargs.setdefault("success", False)
        kwargs.setdefault("attempts", 0)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"<WebhookDelivery(id={self.id}, event='{self.event_type}', success={self.success})>"
