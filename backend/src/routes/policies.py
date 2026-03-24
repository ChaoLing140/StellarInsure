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

router = APIRouter(prefix="/policies", tags=["policies"])


@router.post("/", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(
    policy_data: PolicyCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if policy_data.end_time <= policy_data.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be greater than start time"
        )
    
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


@router.get("/", response_model=PolicyListResponse)
async def get_user_policies(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[PolicyStatus] = Query(None, description="Filter by status"),
    policy_type: Optional[PolicyType] = Query(None, description="Filter by type"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
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
    
    return PolicyListResponse(
        policies=policy_responses,
        total=total,
        page=page,
        per_page=per_page,
        has_next=(offset + per_page) < total
    )


@router.get("/{policy_id}", response_model=PolicyResponse)
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )
    
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


@router.delete("/{policy_id}", response_model=MessageResponse)
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )
    
    policy.status = PolicyStatus.cancelled
    db.commit()
    
    return MessageResponse(message="Policy cancelled successfully")


@router.post("/{policy_id}/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )
    
    current_time = int(dt.utcnow().timestamp())
    
    if not policy.can_claim(current_time):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Policy is not eligible for claims"
        )
    
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