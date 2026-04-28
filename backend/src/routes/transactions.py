from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..database import get_db
from ..models import User, Transaction
from ..schemas import TransactionResponse
from ..dependencies import get_current_active_user
from ..rate_limiter import limiter
from ..config import get_settings

settings = get_settings()

router = APIRouter(prefix="/transactions", tags=["transactions"])


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
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type (e.g., premium, payout)"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., pending, successful, failed)"),
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
    transaction_responses = [
        TransactionResponse(
            id=t.id,
            user_id=t.user_id,
            policy_id=t.policy_id,
            claim_id=t.claim_id,
            transaction_hash=t.transaction_hash,
            amount=float(t.amount),
            transaction_type=t.transaction_type,
            status=t.status,
            created_at=t.created_at,
            updated_at=t.updated_at
        )
        for t in transactions
    ]
    
    has_next = (offset + per_page) < total
    
    return {
        "transactions": transaction_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
        "has_next": has_next
    }
