from datetime import datetime
from typing import Optional
from enum import Enum
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Policy, User, Transaction
from ..schemas import PremiumPaymentRequest, TransactionResponse
from ..dependencies import get_current_active_user
from ..config import get_settings
from ..errors import PolicyNotFoundError
from ..services.stellar_service import StellarService, get_stellar_service

settings = get_settings()

router = APIRouter(prefix="/transactions", tags=["transactions"])

class TransactionType(str, Enum):
    premium = "premium"
    payout = "payout"
    refund = "refund"

class TransactionStatus(str, Enum):
    pending = "pending"
    successful = "successful"
    failed = "failed"

PREMIUM_PAYMENT_IDEMPOTENCY_SCOPE = "premium_payment"


def format_transaction_response(transaction: Transaction) -> TransactionResponse:
    return TransactionResponse(
        id=transaction.id,
        user_id=transaction.user_id,
        policy_id=transaction.policy_id,
        claim_id=transaction.claim_id,
        transaction_hash=transaction.transaction_hash,
        amount=float(transaction.amount),
        transaction_type=transaction.transaction_type,
        status=transaction.status,
        created_at=transaction.created_at,
        updated_at=transaction.updated_at
    )


@router.post(
    "/premium-payments",
    response_model=TransactionResponse,
    summary="Record a premium payment",
    description=(
        "Records a submitted premium payment transaction. The idempotency key is scoped to "
        "the authenticated wallet and premium payment operation, so replaying the same "
        "request with the same key returns the original transaction record."
    ),
    responses={
        200: {"description": "Premium payment record created or replayed"},
        401: {"description": "Not authenticated"},
        404: {"description": "Policy not found"},
        409: {"description": "Idempotency key reused for a different request"},
    }
)
async def record_premium_payment(
    payment_data: PremiumPaymentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    stellar: StellarService = Depends(get_stellar_service)
):
    policy = db.query(Policy).filter(
        Policy.id == payment_data.policy_id,
        Policy.policyholder_id == current_user.id
    ).first()

    if policy is None:
        raise PolicyNotFoundError()

    if round(float(policy.premium), 7) != payment_data.amount:
        raise HTTPException(
            status_code=400,
            detail="Premium payment amount must match the policy premium"
        )

    try:
        transaction = await stellar.store_transaction_record(
            db=db,
            user_id=current_user.id,
            transaction_hash=payment_data.transaction_hash,
            amount=payment_data.amount,
            transaction_type=TransactionType.premium.value,
            policy_id=policy.id,
            status=TransactionStatus.pending.value,
            idempotency_key=payment_data.idempotency_key,
            idempotency_scope=PREMIUM_PAYMENT_IDEMPOTENCY_SCOPE
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return format_transaction_response(transaction)

@router.get(
    "",
    response_model=dict,
    summary="Get user transactions",
    description="Retrieve paginated list of transactions for the authenticated user with optional filtering by type, status, and date range.",
    responses={
        200: {"description": "List of transactions"},
        401: {"description": "Not authenticated"},
        429: {"description": "Rate limit exceeded"},
    }
)
async def get_transactions(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    transaction_type: Optional[TransactionType] = Query(None, description="Filter by transaction type (e.g., premium, payout)"),
    status: Optional[TransactionStatus] = Query(None, description="Filter by status (e.g., pending, successful, failed)"),
    start_date: Optional[datetime] = Query(None, description="Filter transactions from this date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter transactions until this date (ISO format)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated transactions for the current user with optional filters.
    
    Supports filtering by:
    - transaction_type: Type of transaction (premium, payout, etc.)
    - status: Transaction status (pending, successful, failed)
    - start_date: Transactions created after this date
    - end_date: Transactions created before this date
    
    Returns paginated results with policy and claim relationships included.
    """
    # Validate date range
    if start_date and end_date and end_date < start_date:
        from ..errors import ValidationError
        raise ValidationError(
            detail="end_date must be greater than or equal to start_date",
            error_code="VAL_002"
        )
    
    # Build query with filters
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    if start_date:
        query = query.filter(Transaction.created_at >= start_date)
    
    if end_date:
        query = query.filter(Transaction.created_at <= end_date)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    transactions = query.order_by(Transaction.created_at.desc()).offset(offset).limit(per_page).all()
    
    # Convert to response format
    transaction_responses = [format_transaction_response(t) for t in transactions]
    
    has_next = (offset + per_page) < total
    total_pages = (total + per_page - 1) // per_page if total > 0 else 0
    
    return {
        "transactions": transaction_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
        "has_next": has_next,
        "total_pages": total_pages
    }
