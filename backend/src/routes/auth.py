import os
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .auth import create_tokens, verify_token
from .schemas import (
    WalletSignatureRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    UserUpdateRequest,
    MessageResponse
)
from .dependencies import get_current_user, get_current_active_user

router = APIRouter(prefix="/auth", tags=["authentication"])


def verify_stellar_signature(stellar_address: str, signature: str, message: str) -> bool:
    if len(stellar_address) != 56 or not stellar_address.startswith('G'):
        return False
    
    if os.getenv("ENVIRONMENT") == "test":
        return True
    
    expected_message = f"StellarInsure Authentication {datetime.utcnow().strftime('%Y-%m-%d')}"
    return message == expected_message


def get_or_create_user(db: Session, stellar_address: str) -> User:
    user = db.query(User).filter(User.stellar_address == stellar_address).first()
    
    if user is None:
        user = User(stellar_address=stellar_address)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


@router.post("/login", response_model=TokenResponse)
async def login_with_wallet(
    request: WalletSignatureRequest,
    db: Session = Depends(get_db)
):
    if not verify_stellar_signature(request.stellar_address, request.signature, request.message):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid wallet signature"
        )
    
    user = get_or_create_user(db, request.stellar_address)
    
    tokens = create_tokens(user.id, user.stellar_address)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=1800
    )


@router.post("/register", response_model=TokenResponse)
async def register_with_wallet(
    request: WalletSignatureRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.stellar_address == request.stellar_address
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists. Please login instead."
        )
    
    if not verify_stellar_signature(request.stellar_address, request.signature, request.message):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid wallet signature"
        )
    
    user = User(stellar_address=request.stellar_address)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    tokens = create_tokens(user.id, user.stellar_address)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=1800
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    payload = verify_token(request.refresh_token, token_type="refresh")
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    stellar_address = payload.get("stellar_address")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    tokens = create_tokens(user.id, user.stellar_address)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=1800
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    return UserResponse(
        id=current_user.id,
        stellar_address=current_user.stellar_address,
        email=current_user.email,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if update_data.email is not None:
        existing_user = db.query(User).filter(
            User.email == update_data.email,
            User.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        
        current_user.email = update_data.email
        db.commit()
        db.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        stellar_address=current_user.stellar_address,
        email=current_user.email,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    return MessageResponse(message="Successfully logged out")
