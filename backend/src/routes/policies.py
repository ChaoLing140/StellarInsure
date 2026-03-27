from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import User, Policy, Claim, PolicyStatus, PolicyType
from ..schemas import (
    PolicyCreateRequest,
    PolicyResponse,
    PolicyFilterRequest,
    PolicyListResponse,
    ClaimCreateRequest,
    ClaimResponse,
    MessageResponse
)
from ..dependencies import get_current_active_user
from ..errors import (
    PolicyNotFoundError,
    InvalidPolicyTimeRangeError,
    PolicyNotEligibleForClaimError
)
from ..cache import cache_get, cache_set, invalidate_policy_cache

router = APIRouter(prefix="/policies", tags=["policies"])


@router.post(
    "/", 
    response_model=PolicyResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create a new insurance policy",
    description="Creates a new parametric insurance policy for the authenticated user. Payouts will be automated based on the trigger condition.",
    responses={
        201: {"description": "Policy created successfully"},
        400: {"description": "Invalid policy data or invalid time range"},
        401: {"description": "Not authenticated"},
    }
)
async def create_policy(
    policy_data: PolicyCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if policy_data.end_time <= policy_data.start_time:
        raise InvalidPolicyTimeRangeError()
    
    policy = Policy(
        policyholder_id=current_user.id,
        policy_type=policy_data.policy_type,
        coverage_amount=policy_data.coverage_amount,
        premium=policy_data.premium,
        start_time=policy_data.start_time,
        end_time=policy_data.end_time,
        trigger_condition=policy_data.trigger_condition,
        status=PolicyStatus.active
    )
    
    db.add(policy)
    db.commit()
    db.refresh(policy)
    
    invalidate_policy_cache(current_user.id)
    
    return PolicyResponse(
        id=policy.id,
        policyholder_id=policy.policyholder_id,
        policy_type=policy.policy_type,
        coverage_amount=float(policy.coverage_amount),
        premium=float(policy.premium),
        start_time=policy.start_time,
        end_time=policy.end_time,
        trigger_condition=policy.trigger_condition,
        status=policy.status,
        claim_amount=float(policy.claim_amount),
        created_at=policy.created_at,
        updated_at=policy.updated_at
    )


@router.get(
    "/", 
    response_model=PolicyListResponse,
    summary="List user policies",
    description="Returns a paginated list of insurance policies belonging to the authenticated user, with optional filtering by status and type.",
    responses={
        200: {"description": "Paginated list of policies"},
        401: {"description": "Not authenticated"},
    }
)
async def get_user_policies(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[PolicyStatus] = Query(None, description="Filter by status"),
    policy_type: Optional[PolicyType] = Query(None, description="Filter by type"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    status_val = status.value if status else "all"
    type_val = policy_type.value if policy_type else "all"
    cache_key = f"policies:user:{current_user.id}:{status_val}:{type_val}:{page}:{per_page}"
    
    cached = cache_get(cache_key)
    if cached is not None:
        return PolicyListResponse(**cached)
    
    query = db.query(Policy).filter(Policy.policyholder_id == current_user.id)
    
    if status:
        query = query.filter(Policy.status == status)
    
    if policy_type:
        query = query.filter(Policy.policy_type == policy_type)
    
    total = query.count()
    
    offset = (page - 1) * per_page
    policies = query.order_by(Policy.created_at.desc()).offset(offset).limit(per_page).all()
    
    policy_responses = [
        PolicyResponse(
            id=policy.id,
            policyholder_id=policy.policyholder_id,
            policy_type=policy.policy_type,
            coverage_amount=float(policy.coverage_amount),
            premium=float(policy.premium),
            start_time=policy.start_time,
            end_time=policy.end_time,
            trigger_condition=policy.trigger_condition,
            status=policy.status,
            claim_amount=float(policy.claim_amount),
            created_at=policy.created_at,
            updated_at=policy.updated_at
        )
        for policy in policies
    ]
    
    result = PolicyListResponse(
        policies=policy_responses,
        total=total,
        page=page,
        per_page=per_page,
        has_next=(offset + per_page) < total
    )
    
    cache_set(cache_key, result.model_dump(mode="json"))
    
    return result


@router.get(
    "/{policy_id}", 
    response_model=PolicyResponse,
    summary="Get policy details",
    description="Returns detailed information about a specific insurance policy by its ID.",
    responses={
        200: {"description": "Policy details found"},
        404: {"description": "Policy not found"},
        401: {"description": "Not authenticated"},
    }
)
async def get_policy(
    policy_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == policy_id,
        Policy.policyholder_id == current_user.id
    ).first()
    
    if policy is None:
        raise PolicyNotFoundError()
    
    return PolicyResponse(
        id=policy.id,
        policyholder_id=policy.policyholder_id,
        policy_type=policy.policy_type,
        coverage_amount=float(policy.coverage_amount),
        premium=float(policy.premium),
        start_time=policy.start_time,
        end_time=policy.end_time,
        trigger_condition=policy.trigger_condition,
        status=policy.status,
        claim_amount=float(policy.claim_amount),
        created_at=policy.created_at,
        updated_at=policy.updated_at
    )


@router.delete(
    "/{policy_id}", 
    response_model=MessageResponse,
    summary="Cancel a policy",
    description="Marks a policy as cancelled. Only policies belonging to the authenticated user can be cancelled.",
    responses={
        200: {"description": "Policy cancelled successfully"},
        404: {"description": "Policy not found"},
        401: {"description": "Not authenticated"},
    }
)
async def cancel_policy(
    policy_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == policy_id,
        Policy.policyholder_id == current_user.id
    ).first()
    
    if policy is None:
        raise PolicyNotFoundError()
    
    policy.status = PolicyStatus.cancelled
    db.commit()
    
    invalidate_policy_cache(current_user.id)
    
    return MessageResponse(message="Policy cancelled successfully")


@router.post(
    "/{policy_id}/claims", 
    response_model=ClaimResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Submit a claim",
    description="Submits a claim for a specific policy. The claim must be supported by proof and the policy must be eligible for claims (e.g., within time bounds).",
    responses={
        201: {"description": "Claim submitted successfully"},
        400: {"description": "Policy not eligible or invalid claim amount/proof"},
        404: {"description": "Policy not found"},
        401: {"description": "Not authenticated"},
    }
)
async def submit_claim(
    policy_id: int,
    claim_data: ClaimCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime as dt
    
    policy = db.query(Policy).filter(
        Policy.id == policy_id,
        Policy.policyholder_id == current_user.id
    ).first()
    
    if policy is None:
        raise PolicyNotFoundError()
    
    current_time = int(dt.utcnow().timestamp())
    
    if not policy.can_claim(current_time):
        raise PolicyNotEligibleForClaimError()
    
    claim = Claim(
        policy_id=policy_id,
        claimant_id=current_user.id,
        claim_amount=claim_data.claim_amount,
        proof=claim_data.proof,
        timestamp=current_time
    )
    
    policy.status = PolicyStatus.claim_pending
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    return ClaimResponse(
        id=claim.id,
        policy_id=claim.policy_id,
        claimant_id=claim.claimant_id,
        claim_amount=float(claim.claim_amount),
        proof=claim.proof,
        timestamp=claim.timestamp,
        approved=claim.approved,
        created_at=claim.created_at,
        updated_at=claim.updated_at
    )