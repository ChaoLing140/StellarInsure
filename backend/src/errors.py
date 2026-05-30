from typing import Any, Dict, Optional
from fastapi import HTTPException, status

class StellarInsureError(HTTPException):
    """Base class for all StellarInsure API errors."""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code

# Authentication Errors (AUTH_xxx)
class AuthenticationError(StellarInsureError):
    def __init__(self, detail: str, error_code: str = "AUTH_001"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail, error_code)

class InvalidSignatureError(AuthenticationError):
    def __init__(self, detail: str = "Invalid wallet signature"):
        super().__init__(detail, "AUTH_001")

class UserNotFoundError(AuthenticationError):
    def __init__(self, detail: str = "User not found"):
        super().__init__(detail, "AUTH_002")

class UserAlreadyExistsError(StellarInsureError):
    def __init__(self, detail: str = "User already exists"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "AUTH_003")

class TokenExpiredError(AuthenticationError):
    def __init__(self, detail: str = "Token has expired"):
        super().__init__(detail, "AUTH_004")

# Policy Errors (POLICY_xxx)
class PolicyNotFoundError(StellarInsureError):
    def __init__(self, detail: str = "Policy not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, "POLICY_001")

class InvalidPolicyTimeRangeError(StellarInsureError):
    def __init__(self, detail: str = "End time must be greater than start time"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "POLICY_002")

class InsufficientCoverageError(StellarInsureError):
    def __init__(self, detail: str = "Claim amount exceeds remaining coverage"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "POLICY_003")

class PolicyAlreadyTerminalError(StellarInsureError):
    def __init__(self, detail: str = "Policy is already in a terminal state"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "POLICY_004")

# Claim Errors (CLAIM_xxx)
class ClaimNotFoundError(StellarInsureError):
    def __init__(self, detail: str = "Claim not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, "CLAIM_001")

class PolicyNotEligibleForClaimError(StellarInsureError):
    def __init__(self, detail: str = "Policy is not eligible for claims"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "CLAIM_002")

class DuplicatePendingClaimError(StellarInsureError):
    def __init__(self, detail: str = "A pending claim already exists for this policy"):
        super().__init__(status.HTTP_409_CONFLICT, detail, "CLAIM_003")

# Storage Errors (STORAGE_xxx)
class FileNotFoundStorageError(StellarInsureError):
    def __init__(self, detail: str = "File not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, "STORAGE_001")

class InvalidStorageTokenError(StellarInsureError):
    def __init__(self, detail: str = "Invalid or expired storage token"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail, "STORAGE_002")

class FileTooLargeError(StellarInsureError):
    def __init__(self, detail: str = "File size exceeds limit"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "STORAGE_003")

class InvalidFileTypeError(StellarInsureError):
    def __init__(self, detail: str = "File type not allowed"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, "STORAGE_004")

# Authorization Errors (AUTHZ_xxx)
class NotAuthorizedError(StellarInsureError):
    def __init__(self, detail: str = "Not authorized to perform this action"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail, "AUTHZ_001")

# Validation Errors (VAL_xxx)
class ValidationError(StellarInsureError):
    def __init__(self, detail: str, error_code: str = "VAL_001"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail, error_code)
