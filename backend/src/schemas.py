from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, model_validator, EmailStr
from .models import PolicyType, PolicyStatus


class WalletSignatureRequest(BaseModel):
    stellar_address: str = Field(
        ...,
        min_length=56,
        max_length=56,
        description="Stellar wallet address (starts with 'G')",
        example="GBAV3NRN5A7U729J5N5FEY66N47UPK44BTMEDF2F2D7W2N5E5G7W2N5E"
    )
    signature: str = Field(
        ..., 
        min_length=1, 
        description="Base64-encoded cryptographic signature",
        example="AAAAAH..."
    )
    message: str = Field(
        ..., 
        min_length=1, 
        description="The original message that was signed",
        example="StellarInsure Login 2026-03-27"
    )

    @field_validator('stellar_address')
    @classmethod
    def validate_stellar_address(cls, v: str) -> str:
        if not v.startswith('G'):
            raise ValueError('Stellar address must start with "G"')
        if not v.isalnum():
            raise ValueError('Stellar address must contain only alphanumeric characters')
        return v


class MessageResponse(BaseModel):
    message: str = Field(..., description="Response message", example="Operation successful")


class ErrorResponse(BaseModel):
    error_code: str = Field(..., description="Standardized error code", example="AUTH_001")
    detail: str = Field(..., description="Human-readable error description", example="Invalid wallet signature")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time of error occurrence")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token", example="eyJhbGci...")
    refresh_token: str = Field(..., description="JWT refresh token", example="eyJhbGci...")
    token_type: str = Field("bearer", description="Type of token", example="bearer")
    expires_in: int = Field(..., description="Token expiration in seconds", example=3600)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(
        ..., 
        min_length=1, 
        description="Refresh token to get a new access token",
        example="eyJhbGci..."
    )


class UserResponse(BaseModel):
    id: int = Field(..., description="Unique user identifier", example=1)
    stellar_address: str = Field(..., description="Stellar public address", example="GBAV3N...")
    email: Optional[EmailStr] = Field(None, description="User email (optional)", example="user@example.com")
    created_at: datetime = Field(..., description="Timestamp of user creation")
    updated_at: datetime = Field(..., description="Timestamp of last update")

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="User email address")

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) > 255:
                raise ValueError('Email must not exceed 255 characters')
        return v


class PolicyCreateRequest(BaseModel):
    policy_type: PolicyType = Field(
        ..., 
        description="Type of insurance policy (weather, flight, etc.)",
        example=PolicyType.weather
    )
    coverage_amount: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Coverage amount in Stellar lumens (XLM)",
        example=1000.50
    )
    premium: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Premium amount in Stellar lumens (XLM)",
        example=50.25
    )
    start_time: int = Field(
        ...,
        gt=0,
        description="Policy start time as Unix timestamp",
        example=1711536000
    )
    end_time: int = Field(
        ...,
        gt=0,
        description="Policy end time as Unix timestamp",
        example=1743072000
    )
    trigger_condition: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Condition that triggers claim payout (e.g., 'rainfall > 100mm')",
        example="rainfall > 100mm"
    )

    @field_validator('policy_type')
    @classmethod
    def validate_policy_type(cls, v: PolicyType) -> PolicyType:
        valid_types = [PolicyType.weather, PolicyType.smart_contract, 
                       PolicyType.flight, PolicyType.health, PolicyType.asset]
        if v not in valid_types:
            raise ValueError(f'Invalid policy type. Must be one of: {", ".join([t.value for t in valid_types])}')
        return v

    @field_validator('coverage_amount', 'premium')
    @classmethod
    def validate_amount_precision(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 1_000_000_000:
            raise ValueError('Amount cannot exceed 1,000,000,000')
        return round(v, 7)

    @model_validator(mode='after')
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError('End time must be greater than start time')
        return self


class PolicyFilterRequest(BaseModel):
    status: Optional[PolicyStatus] = Field(
        None, 
        description="Filter by policy status (active, expired, etc.)",
        example=PolicyStatus.active
    )
    policy_type: Optional[PolicyType] = Field(
        None, 
        description="Filter by policy type",
        example=PolicyType.weather
    )

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: Optional[PolicyStatus]) -> Optional[PolicyStatus]:
        if v is not None:
            valid_statuses = [
                PolicyStatus.active, PolicyStatus.expired, PolicyStatus.cancelled,
                PolicyStatus.claim_pending, PolicyStatus.claim_approved, PolicyStatus.claim_rejected
            ]
            if v not in valid_statuses:
                raise ValueError(f'Invalid status. Must be one of: {", ".join([s.value for s in valid_statuses])}')
        return v

    @field_validator('policy_type')
    @classmethod
    def validate_type(cls, v: Optional[PolicyType]) -> Optional[PolicyType]:
        if v is not None:
            valid_types = [PolicyType.weather, PolicyType.smart_contract,
                           PolicyType.flight, PolicyType.health, PolicyType.asset]
            if v not in valid_types:
                raise ValueError(f'Invalid policy type. Must be one of: {", ".join([t.value for t in valid_types])}')
        return v


class PolicyListResponse(BaseModel):
    policies: list = Field(..., description="List of policies in the current page")
    total: int = Field(..., description="Total number of policies matching the filter", example=100)
    page: int = Field(..., description="Current page number", example=1)
    per_page: int = Field(..., description="Number of items per page", example=10)
    has_next: bool = Field(..., description="Whether there are more pages available", example=True)


class PolicyResponse(BaseModel):
    id: int = Field(..., description="Unique policy identifier", example=1)
    policyholder_id: int = Field(..., description="ID of the user who holds the policy", example=1)
    policy_type: PolicyType = Field(..., description="Type of the policy", example=PolicyType.weather)
    coverage_amount: float = Field(..., description="Maximum payout amount in XLM", example=1000.0)
    premium: float = Field(..., description="Premium paid for the policy in XLM", example=50.0)
    start_time: int = Field(..., description="Policy start time (Unix timestamp)", example=1711536000)
    end_time: int = Field(..., description="Policy end time (Unix timestamp)", example=1743072000)
    trigger_condition: str = Field(..., description="Condition for automatic payout", example="rainfall > 100mm")
    status: PolicyStatus = Field(..., description="Current status of the policy", example=PolicyStatus.active)
    claim_amount: float = Field(..., description="Total amount claimed so far in XLM", example=0.0)
    created_at: datetime = Field(..., description="Policy creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class ClaimCreateRequest(BaseModel):
    policy_id: int = Field(..., gt=0, description="ID of the policy to claim against", example=1)
    claim_amount: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Claim amount in XLM",
        example=500.0
    )
    proof: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Supporting evidence (text or path to file)",
        example="Rainfall reached 120mm confirmed by local weather station"
    )

    @field_validator('claim_amount')
    @classmethod
    def validate_claim_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Claim amount must be positive')
        if v > 1_000_000_000:
            raise ValueError('Claim amount cannot exceed 1,000,000,000')
        return round(v, 7)

    @field_validator('proof')
    @classmethod
    def validate_proof(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Proof cannot be empty or whitespace only')
        return v.strip()


class ClaimResponse(BaseModel):
    id: int = Field(..., description="Unique claim identifier", example=1)
    policy_id: int = Field(..., description="ID of the related policy", example=1)
    claimant_id: int = Field(..., description="ID of the user who filed the claim", example=1)
    claim_amount: float = Field(..., description="Requested payout amount in XLM", example=500.0)
    proof: str = Field(..., description="Secure URL or path to proof document", example="http://example.com/storage/...")
    timestamp: int = Field(..., description="Claim submission timestamp (Unix)", example=1711536000)
    approved: bool = Field(..., description="Whether the claim has been approved", example=False)
    created_at: datetime = Field(..., description="Claim creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int = Field(..., description="Unique transaction record identifier", example=1)
    user_id: int = Field(..., description="ID of the user related to this transaction", example=1)
    policy_id: Optional[int] = Field(None, description="Related policy ID (if any)", example=1)
    claim_id: Optional[int] = Field(None, description="Related claim ID (if any)", example=1)
    transaction_hash: str = Field(..., description="Stellar blockchain transaction hash", example="abc123hash...")
    amount: float = Field(..., description="Transaction amount in XLM", example=50.25)
    transaction_type: str = Field(..., description="Type of transaction (premium, payout, etc.)", example="premium")
    status: str = Field(..., description="On-chain status of the transaction", example="successful")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str = Field(..., description="Response message", example="Operation successful")


# --- Webhook Schemas ---

VALID_WEBHOOK_EVENTS = [
    "policy.created", "policy.cancelled",
    "claim.created", "claim.approved", "claim.rejected",
]


class WebhookCreateRequest(BaseModel):
    url: str = Field(
        ...,
        min_length=1,
        max_length=2048,
        description="URL to deliver webhook events to",
        example="https://example.com/webhooks/stellar"
    )
    event_types: List[str] = Field(
        ...,
        min_length=1,
        description="List of event types to subscribe to",
        example=["policy.created", "claim.created"]
    )

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("https://", "http://")):
            raise ValueError("Webhook URL must start with https:// or http://")
        return v

    @field_validator("event_types")
    @classmethod
    def validate_event_types(cls, v: List[str]) -> List[str]:
        for event in v:
            if event not in VALID_WEBHOOK_EVENTS:
                raise ValueError(
                    f"Invalid event type '{event}'. "
                    f"Valid types: {', '.join(VALID_WEBHOOK_EVENTS)}"
                )
        return v


class WebhookUpdateRequest(BaseModel):
    url: Optional[str] = Field(None, max_length=2048, description="Updated webhook URL")
    event_types: Optional[List[str]] = Field(None, description="Updated event types")
    is_active: Optional[bool] = Field(None, description="Whether the webhook is active")

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.startswith(("https://", "http://")):
            raise ValueError("Webhook URL must start with https:// or http://")
        return v

    @field_validator("event_types")
    @classmethod
    def validate_event_types(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            for event in v:
                if event not in VALID_WEBHOOK_EVENTS:
                    raise ValueError(
                        f"Invalid event type '{event}'. "
                        f"Valid types: {', '.join(VALID_WEBHOOK_EVENTS)}"
                    )
        return v


class WebhookResponse(BaseModel):
    id: int = Field(..., description="Webhook ID")
    url: str = Field(..., description="Webhook delivery URL")
    event_types: List[str] = Field(..., description="Subscribed event types")
    is_active: bool = Field(..., description="Whether the webhook is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class WebhookDeliveryResponse(BaseModel):
    id: int = Field(..., description="Delivery ID")
    webhook_id: int = Field(..., description="Related webhook ID")
    event_type: str = Field(..., description="Event type delivered")
    response_status: Optional[int] = Field(None, description="HTTP response status code")
    success: bool = Field(..., description="Whether delivery was successful")
    attempts: int = Field(..., description="Number of delivery attempts")
    created_at: datetime = Field(..., description="Delivery creation timestamp")

    class Config:
        from_attributes = True