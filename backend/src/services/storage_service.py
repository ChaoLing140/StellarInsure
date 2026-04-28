import os
import uuid
import time
import hmac
import hashlib
import base64
from typing import Optional, List
from fastapi import UploadFile, HTTPException, status
from ..config import get_settings

settings = get_settings()

class StorageService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        self.max_size = settings.max_upload_size
        self.secret_key = settings.storage_secret_key
        self.base_url = settings.base_url
        self.allowed_extensions = [".jpg", ".jpeg", ".png", ".pdf"]
        self.allowed_content_types = ["image/jpeg", "image/png", "application/pdf"]

        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_file(self, file: UploadFile):
        # Validate extension
        ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
        if ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File extension {ext} not allowed. Allowed: {', '.join(self.allowed_extensions)}"
            )

        # Validate content type
        if file.content_type not in self.allowed_content_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Content type {file.content_type} not allowed. Allowed: {', '.join(self.allowed_content_types)}"
            )

    async def upload_file(self, file: UploadFile, folder: str = "general") -> str:
        self.validate_file(file)

        # Read content to check size
        content = await file.read()
        if len(content) > self.max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds limit of {self.max_size / (1024 * 1024):.1f}MB"
            )

        # Create folder if it doesn't exist
        folder_path = os.path.join(self.upload_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        # Generate unique filename
        ext = os.path.splitext(file.filename)[1].lower()
        filename = f"{uuid.uuid4()}{ext}"
        relative_path = os.path.join(folder, filename)
        full_path = os.path.join(self.upload_dir, relative_path)

        # Save file
        with open(full_path, "wb") as f:
            f.write(content)

        return relative_path

    def generate_secure_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Generates a secure, expiring URL for a file.
        The token format is: base64(path:expiry:signature)
        """
        expiry = int(time.time()) + expires_in
        msg = f"{file_path}:{expiry}"
        signature = hmac.new(
            self.secret_key.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()

        token_data = f"{msg}:{signature}"
        token = base64.urlsafe_b64encode(token_data.encode()).decode()

        return f"{self.base_url}/storage/files/{token}"

    def validate_token(self, token: str) -> str:
        """
        Validates a secure token and returns the file path.
        """
        try:
            # Decode token
            token_bytes = base64.urlsafe_b64decode(token.encode())
            token_str = token_bytes.decode()
            
            parts = token_str.split(":")
            if len(parts) != 3:
                raise ValueError("Invalid token format")
            
            file_path, expiry_str, signature = parts
            expiry = int(expiry_str)

            # Check expiration
            if time.time() > expiry:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Link has expired"
                )

            # Verify signature
            msg = f"{file_path}:{expiry_str}"
            expected_signature = hmac.new(
                self.secret_key.encode(),
                msg.encode(),
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(signature, expected_signature):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid signature"
                )

            # Return full path for serving
            return os.path.join(self.upload_dir, file_path)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or malformed token"
            )

    def delete_file(self, file_path: str):
        """
        Deletes a file from the upload directory.
        """
        if not file_path:
            return
            
        full_path = os.path.join(self.upload_dir, file_path)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception as e:
                # Log error but don't fail, file might be already gone or locked
                print(f"Error deleting file {full_path}: {e}")

# Singleton instance
storage_service = StorageService()
