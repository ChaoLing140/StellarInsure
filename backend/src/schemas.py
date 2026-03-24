from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .models import PolicyType, PolicyStatus


class WalletSignatureRequest(BaseModel):
    stellar_address: str = Field(..., min_length=56, max_length=56)
    signature: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    stellar_address: str
    email: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    email: Optional[str] = None


class PolicyCreateRequest(BaseModel):
    policy_type: PolicyType
    coverage_amount: float = Field(..., gt=0)
    premium: float = Field(..., gt=0)
    start_time: int = Field(..., gt=0)
    end_time: int = Field(..., gt=0)
    trigger_condition: str = Field(..., min_length=1, max_length=500)


class PolicyResponse(BaseModel):
    id: int
    policyholder_id: int
    policy_type: PolicyType
    coverage_amount: float
    premium: float
    start_time: int
    end_time: int
    trigger_condition: str
    status: PolicyStatus
    claim_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClaimCreateRequest(BaseModel):
    policy_id: int
    claim_amount: float = Field(..., gt=0)
    proof: str = Field(..., min_length=1, max_length=1000)


class ClaimResponse(BaseModel):
    id: int
    policy_id: int
    claimant_id: int
    claim_amount: float
    proof: str
    timestamp: int
    approved: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    policy_id: Optional[int]
    claim_id: Optional[int]
    transaction_hash: str
    amount: float
    transaction_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
