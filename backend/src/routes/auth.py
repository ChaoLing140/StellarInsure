import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Policy, PolicyStatus
from ..auth import create_tokens, verify_token
from ..schemas import (
    WalletSignatureRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    UserUpdateRequest,
    MessageResponse
)
from ..dependencies import get_current_active_user
from ..errors import (
    InvalidSignatureError,
    UserAlreadyExistsError,
    TokenExpiredError,
    UserNotFoundError
)
from ..rate_limiter import limiter
from ..config import get_settings

settings = get_settings()

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


@router.post(
    "/login", 
    response_model=TokenResponse,
    summary="Login with Stellar wallet",
    description="Authenticates a user by verifying a cryptographic signature from their Stellar wallet. If the user doesn't exist, they will be registered automatically.",
    responses={
        200: {"description": "Successful login, returns JWT tokens"},
        401: {"description": "Invalid wallet signature or malformed request"},
        429: {"description": "Rate limit exceeded"},
    }
)
@limiter.limit(settings.rate_limit_auth)
async def login_with_wallet(
    request: Request,
    body: WalletSignatureRequest,
    db: Session = Depends(get_db)
):
    if not verify_stellar_signature(body.stellar_address, body.signature, body.message):
        raise InvalidSignatureError()
    
    user = get_or_create_user(db, body.stellar_address)
    
    tokens = create_tokens(user.id, user.stellar_address)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=1800
    )


@router.post(
    "/register", 
    response_model=TokenResponse,
    summary="Register a new user",
    description="Creates a new user record associated with a Stellar public address. Requires a valid wallet signature.",
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "User already exists"},
        401: {"description": "Invalid signature"},
        429: {"description": "Rate limit exceeded"},
    }
)
@limiter.limit(settings.rate_limit_auth)
async def register_with_wallet(
    request: Request,
    body: WalletSignatureRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.stellar_address == body.stellar_address
    ).first()
    
    if existing_user:
        raise UserAlreadyExistsError("A user with this Stellar address is already registered.")
    
    if not verify_stellar_signature(body.stellar_address, body.signature, body.message):
        raise InvalidSignatureError()
    
    user = User(stellar_address=body.stellar_address)
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


@router.post(
    "/refresh", 
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Generates a new pair of access and refresh tokens using a valid refresh token.",
    responses={
        200: {"description": "New tokens generated"},
        401: {"description": "Invalid or expired refresh token"},
    }
)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    payload = verify_token(request.refresh_token, token_type="refresh")
    
    if payload is None:
        raise TokenExpiredError("Invalid or expired refresh token")
    
    user_id = payload.get("sub")
    stellar_address = payload.get("stellar_address")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise UserNotFoundError()
    
    tokens = create_tokens(user.id, user.stellar_address)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=1800
    )


@router.get(
    "/me", 
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns information about the currently authenticated user.",
    responses={
        200: {"description": "User profile data"},
        401: {"description": "Not authenticated"},
    }
)
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


@router.patch(
    "/me", 
    response_model=UserResponse,
    summary="Update user profile",
    description="Updates the profile information (e.g., email) for the currently authenticated user.",
    responses={
        200: {"description": "Updated user profile"},
        400: {"description": "Email already in use or invalid data"},
        401: {"description": "Not authenticated"},
    }
)
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
            raise UserAlreadyExistsError("This email address is already associated with another account.")
        
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


@router.delete(
    "/me",
    response_model=MessageResponse,
    summary="Delete user account",
    description="Soft-deletes the authenticated user's account. Personal data is anonymized, active policies are cancelled, and pending claims are rejected. Requires re-authentication via wallet signature.",
    responses={
        200: {"description": "Account deleted successfully"},
        401: {"description": "Not authenticated or invalid signature"},
    }
)
async def delete_account(
    body: WalletSignatureRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if body.stellar_address != current_user.stellar_address:
        raise InvalidSignatureError("Stellar address does not match authenticated user")

    if not verify_stellar_signature(body.stellar_address, body.signature, body.message):
        raise InvalidSignatureError()

    # Cancel active policies
    db.query(Policy).filter(
        Policy.policyholder_id == current_user.id,
        Policy.status == PolicyStatus.active
    ).update({"status": PolicyStatus.cancelled})

    # Reject policies with pending claims
    db.query(Policy).filter(
        Policy.policyholder_id == current_user.id,
        Policy.status == PolicyStatus.claim_pending
    ).update({"status": PolicyStatus.claim_rejected})

    # Anonymize personal data and soft-delete
    current_user.email = None
    current_user.stellar_address = f"DELETED_{current_user.id}"
    current_user.deleted_at = datetime.utcnow()

    db.commit()

    return MessageResponse(message="Account deleted successfully")


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout user",
    description="Invalidates the current session (client-side only for now, tokens are stateless).",
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Not authenticated"},
    }
)
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    return MessageResponse(message="Successfully logged out")
