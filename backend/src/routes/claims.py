from datetime import datetime as dt
import logging
from fastapi import APIRouter, Depends, status, Query, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from ..database import get_db
from ..models import User, Policy, Claim, PolicyStatus
from ..schemas import (
    ClaimCreateRequest,
    ClaimResponse,
    MessageResponse
)
from ..dependencies import get_current_active_user
from ..errors import (
    PolicyNotFoundError,
    PolicyNotEligibleForClaimError,
    InsufficientCoverageError,
    ClaimNotFoundError
)
from ..services.storage_service import storage_service
from ..services.webhook_service import dispatch_webhook_event

router = APIRouter(prefix="/claims", tags=["claims"])
logger = logging.getLogger(__name__)

def format_claim_response(claim: Claim) -> ClaimResponse:
    proof = claim.proof
    # If proof looks like a stored file path (basic heuristic), generate secure URL
    if "/" in proof or "." in proof:
        try:
            proof = storage_service.generate_secure_url(proof)
        except Exception as e:
            logger.warning(
                "Failed to generate secure URL for claim %s proof: %s",
                claim.id, e
            )
            
    return ClaimResponse(
        id=claim.id,
        policy_id=claim.policy_id,
        claimant_id=claim.claimant_id,
        claim_amount=float(claim.claim_amount),
        proof=proof,
        timestamp=claim.timestamp,
        approved=claim.approved,
        created_at=claim.created_at,
        updated_at=claim.updated_at
    )


@router.post(
    "/", 
    response_model=ClaimResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create a new claim (text proof)",
    description="Submits a claim for a specific policy using text-based proof. The policy must be eligible for claims (e.g., within time bounds and not expired).",
    responses={
        201: {"description": "Claim submitted successfully"},
        400: {"description": "Policy not eligible or invalid claim amount/proof"},
        404: {"description": "Policy not found"},
        401: {"description": "Not authenticated"},
    }
)
async def create_claim(
    claim_data: ClaimCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == claim_data.policy_id,
        Policy.policyholder_id == current_user.id
    ).first()

    if policy is None:
        raise PolicyNotFoundError()

    current_time = int(dt.utcnow().timestamp())

    if not policy.can_claim(current_time):
        raise PolicyNotEligibleForClaimError()

    if claim_data.claim_amount > float(policy.remaining_coverage()):
        raise InsufficientCoverageError()

    claim = Claim(
        policy_id=claim_data.policy_id,
        claimant_id=current_user.id,
        claim_amount=claim_data.claim_amount,
        proof=claim_data.proof,
        timestamp=current_time
    )

    policy.status = PolicyStatus.claim_pending
    db.add(claim)
    db.commit()
    db.refresh(claim)

    background_tasks.add_task(
        dispatch_webhook_event,
        db=db,
        user_id=current_user.id,
        event_type="claim.created",
        payload={
            "claim_id": claim.id,
            "policy_id": claim.policy_id,
            "claim_amount": float(claim.claim_amount),
            "approved": claim.approved,
        },
    )

    return format_claim_response(claim)


@router.post(
    "/upload", 
    response_model=ClaimResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create a new claim (file upload proof)",
    description="Submits a claim for a specific policy by uploading a proof document (image or PDF). The file is stored securely and a signed URL is generated for access.",
    responses={
        201: {"description": "Claim submitted with file upload successfully"},
        400: {"description": "Policy not eligible or invalid file type/size"},
        404: {"description": "Policy not found"},
        401: {"description": "Not authenticated"},
    }
)
async def create_claim_with_file(
    background_tasks: BackgroundTasks,
    policy_id: int = Form(...),
    claim_amount: float = Form(..., gt=0),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == policy_id,
        Policy.policyholder_id == current_user.id
    ).first()

    if policy is None:
        raise PolicyNotFoundError()

    current_time = int(dt.utcnow().timestamp())

    if not policy.can_claim(current_time):
        raise PolicyNotEligibleForClaimError()

    if claim_amount > float(policy.remaining_coverage()):
        raise InsufficientCoverageError()

    # Use StorageService for upload
    file_path = await storage_service.upload_file(file, folder="claim_proofs")

    claim = Claim(
        policy_id=policy_id,
        claimant_id=current_user.id,
        claim_amount=claim_amount,
        proof=file_path,
        timestamp=current_time
    )

    policy.status = PolicyStatus.claim_pending
    db.add(claim)
    db.commit()
    db.refresh(claim)

    background_tasks.add_task(
        dispatch_webhook_event,
        db=db,
        user_id=current_user.id,
        event_type="claim.created",
        payload={
            "claim_id": claim.id,
            "policy_id": claim.policy_id,
            "claim_amount": float(claim.claim_amount),
            "approved": claim.approved,
        },
    )

    return format_claim_response(claim)


@router.get(
    "/{claim_id}", 
    response_model=ClaimResponse,
    summary="Get claim details",
    description="Returns detailed information about a specific claim, including a secure link to the proof document if applicable.",
    responses={
        200: {"description": "Claim details found"},
        404: {"description": "Claim not found"},
        401: {"description": "Not authenticated"},
    }
)
async def get_claim(
    claim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.claimant_id == current_user.id
    ).first()

    if claim is None:
        raise ClaimNotFoundError()

    return format_claim_response(claim)


@router.get(
    "/", 
    response_model=dict,
    summary="List user claims",
    description="Returns a paginated list of claims submitted by the authenticated user. Can be filtered by policy ID and approval status.",
    responses={
        200: {"description": "Paginated list of claims"},
        401: {"description": "Not authenticated"},
    }
)
async def list_claims(
    policy_id: Optional[int] = Query(None, description="Filter by policy ID"),
    approved: Optional[bool] = Query(None, description="Filter by approval status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Claim).filter(Claim.claimant_id == current_user.id)

    if policy_id is not None:
        query = query.filter(Claim.policy_id == policy_id)

    if approved is not None:
        query = query.filter(Claim.approved == approved)

    total = query.count()

    offset = (page - 1) * per_page
    claims = query.order_by(Claim.created_at.desc()).offset(offset).limit(per_page).all()

    claim_responses = [
        ClaimResponse(
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
        for claim in claims
    ]

    return {
        "claims": claim_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
        "has_next": (offset + per_page) < total
    }


@router.patch(
    "/{claim_id}", 
    response_model=ClaimResponse,
    summary="Update claim status (Mock/Admin)",
    description="Updates the approval status of a claim. (Note: In a production environment, this would be handled by an Oracle or Admin process).",
    responses={
        200: {"description": "Claim status updated"},
        404: {"description": "Claim not found"},
        401: {"description": "Not authenticated"},
    }
)
async def update_claim_status(
    claim_id: int,
    background_tasks: BackgroundTasks,
    approved: bool = Query(..., description="Approval status"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.claimant_id == current_user.id
    ).first()

    if claim is None:
        raise ClaimNotFoundError()

    claim.approved = approved

    policy = db.query(Policy).filter(Policy.id == claim.policy_id).first()
    if policy:
        if approved:
            policy.status = PolicyStatus.claim_approved
            policy.claim_amount = policy.claim_amount + claim.claim_amount
        else:
            policy.status = PolicyStatus.claim_rejected

    db.commit()
    db.refresh(claim)

    event_type = "claim.approved" if approved else "claim.rejected"
    background_tasks.add_task(
        dispatch_webhook_event,
        db=db,
        user_id=current_user.id,
        event_type=event_type,
        payload={
            "claim_id": claim.id,
            "policy_id": claim.policy_id,
            "claim_amount": float(claim.claim_amount),
            "approved": claim.approved,
            "policy_status": policy.status.value if policy else None,
        },
    )

    return format_claim_response(claim)


@router.get(
    "/policy/{policy_id}", 
    response_model=dict,
    summary="List claims for a policy",
    description="Returns all claims associated with a specific policy belonging to the authenticated user.",
    responses={
        200: {"description": "List of claims for the policy"},
        404: {"description": "Policy not found"},
        401: {"description": "Not authenticated"},
    }
)
async def list_claims_by_policy(
    policy_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == policy_id,
        Policy.policyholder_id == current_user.id
    ).first()

    if policy is None:
        raise PolicyNotFoundError()

    query = db.query(Claim).filter(Claim.policy_id == policy_id)

    total = query.count()

    offset = (page - 1) * per_page
    claims = query.order_by(Claim.created_at.desc()).offset(offset).limit(per_page).all()

    claim_responses = [
        ClaimResponse(
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
        for claim in claims
    ]

    return {
        "claims": claim_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
        "has_next": (offset + per_page) < total
    }
