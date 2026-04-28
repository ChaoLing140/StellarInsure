import os
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import FileResponse
from ..database import get_db
from ..models import User, Claim
from ..schemas import MessageResponse
from ..dependencies import get_current_active_user
from ..services.storage_service import storage_service
from ..errors import FileNotFoundStorageError, InvalidStorageTokenError

router = APIRouter(prefix="/storage", tags=["storage"])

@router.get(
    "/files/{token}",
    summary="Retrieve a secure file",
    description="Serves a file if the provided token is valid, has not expired, and contains a valid signature for the requested file path.",
    responses={
        200: {
            "description": "The requested file",
            "content": {"image/*": {}, "application/pdf": {}}
        },
        404: {"description": "File not found or invalid/expired token"},
        403: {"description": "Invalid signature or token"}
    }
)
async def get_file(token: str):
    """
    Serves a file if the provided token is valid and hasn't expired.
    """
    try:
        file_path = storage_service.validate_token(token)
    except:
        raise InvalidStorageTokenError()
    
    if not os.path.exists(file_path):
        raise FileNotFoundStorageError()
    
    return FileResponse(file_path)


@router.delete(
    "/files/{claim_id}",
    response_model=MessageResponse,
    summary="Delete a file and its record",
    description="Deletes a proof file and its associated database record (Claim). Only the claimant can perform this action.",
    responses={
        200: {"description": "File and claim record deleted successfully"},
        404: {"description": "Claim not found"},
        403: {"description": "Not authorized to delete this file"}
    }
)
async def delete_file(
    claim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if claim.claimant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")
        
    # Delete file from storage
    storage_service.delete_file(claim.proof)
    
    # Delete database record
    db.delete(claim)
    db.commit()
    
    return MessageResponse(message="File and claim record deleted successfully")
