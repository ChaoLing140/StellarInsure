import pytest
import os
import time
import base64
from io import BytesIO
from fastapi import UploadFile, HTTPException
from fastapi.testclient import TestClient
from src.errors import InvalidFileTypeError, FileTooLargeError
from src.services.storage_service import StorageService

class TestStorageService:
    @pytest.fixture
    def storage_service(self, tmp_path):
        # Create a mock settings object or override settings
        from src.config import Settings
        settings = Settings(
            upload_dir=str(tmp_path / "uploads"),
            max_upload_size=1024,  # 1KB for testing
            storage_secret_key="test-secret",
            base_url="http://testserver"
        )
        
        # Manually initialize service with test settings
        service = StorageService()
        service.upload_dir = settings.upload_dir
        service.max_size = settings.max_upload_size
        service.secret_key = settings.storage_secret_key
        service.base_url = settings.base_url
        os.makedirs(service.upload_dir, exist_ok=True)
        return service

    @pytest.mark.asyncio
    async def test_upload_valid_file(self, storage_service):
        content = b"\x89PNG\r\n\x1a\ndata"
        file = UploadFile(filename="test.png", file=BytesIO(content), headers={"content-type": "image/png"})

        path = await storage_service.upload_file(file, folder="test")

        assert path.startswith("test/")
        assert path.endswith(".png")
        assert os.path.exists(os.path.join(storage_service.upload_dir, path))

    @pytest.mark.asyncio
    async def test_upload_invalid_type(self, storage_service):
        content = b"test content"
        file = UploadFile(filename="test.exe", file=BytesIO(content), headers={"content-type": "application/x-msdownload"})

        with pytest.raises(InvalidFileTypeError) as exc:
            await storage_service.upload_file(file)
        assert exc.value.status_code == 400
        assert exc.value.error_code == "STORAGE_004"

    @pytest.mark.asyncio
    async def test_upload_too_large(self, storage_service):
        content = b"\x89PNG\r\n\x1a\n" + b"a" * 2000  # valid PNG header + >1KB body
        file = UploadFile(filename="large.png", file=BytesIO(content), headers={"content-type": "image/png"})
        
        with pytest.raises(FileTooLargeError) as exc:
            await storage_service.upload_file(file)
        assert exc.value.status_code == 413
        assert exc.value.error_code == "STORAGE_003"

    def test_secure_url_generation_and_validation(self, storage_service):
        file_path = "test/file.png"
        url = storage_service.generate_secure_url(file_path, expires_in=60)
        
        assert "http://testserver/storage/files/" in url
        token = url.split("/")[-1]
        
        # Validate token
        validated_path = storage_service.validate_token(token)
        assert validated_path == os.path.join(storage_service.upload_dir, file_path)

    def test_secure_url_expiration(self, storage_service):
        file_path = "test/file.png"
        # Generate token that expires in -1 second
        url = storage_service.generate_secure_url(file_path, expires_in=-1)
        token = url.split("/")[-1]
        
        with pytest.raises(HTTPException) as exc:
            storage_service.validate_token(token)
        assert exc.value.status_code == 403
        assert "expired" in exc.value.detail

    @pytest.mark.asyncio
    async def test_upload_valid_jpeg(self, storage_service):
        content = b"\xff\xd8\xff\xe0" + b"x" * 10
        file = UploadFile(filename="photo.jpeg", file=BytesIO(content), headers={"content-type": "image/jpeg"})

        path = await storage_service.upload_file(file, folder="test")

        assert path.endswith(".jpeg")

    @pytest.mark.asyncio
    async def test_upload_valid_pdf(self, storage_service):
        content = b"%PDF-1.4\n" + b"x" * 10
        file = UploadFile(filename="doc.pdf", file=BytesIO(content), headers={"content-type": "application/pdf"})

        path = await storage_service.upload_file(file, folder="test")

        assert path.endswith(".pdf")

    @pytest.mark.asyncio
    async def test_upload_mismatched_signature_rejected(self, storage_service):
        # JPEG bytes but declared as PNG — should be rejected
        content = b"\xff\xd8\xff\xe0" + b"x" * 10
        file = UploadFile(filename="image.png", file=BytesIO(content), headers={"content-type": "image/png"})

        with pytest.raises(InvalidFileTypeError) as exc:
            await storage_service.upload_file(file)
        assert exc.value.status_code == 400
        assert exc.value.error_code == "STORAGE_004"

    def test_invalid_token_signature(self, storage_service):
        file_path = "test/file.png"
        url = storage_service.generate_secure_url(file_path, expires_in=60)
        token = url.split("/")[-1]
        
        # Tamper with token (decode, modify, re-encode)
        token_bytes = base64.urlsafe_b64decode(token.encode())
        token_str = token_bytes.decode()
        parts = token_str.split(":")
        parts[0] = "malicious/path.png" # Change path
        tampered_data = ":".join(parts)
        tampered_token = base64.urlsafe_b64encode(tampered_data.encode()).decode()
        
        with pytest.raises(HTTPException) as exc:
            storage_service.validate_token(tampered_token)
        assert exc.value.status_code == 403
        assert "Invalid signature" in exc.value.detail

    def test_path_traversal_token_rejected(self, storage_service):
        # Generate token with traversal path and valid signature
        file_path = "test/../../etc/passwd"
        url = storage_service.generate_secure_url(file_path, expires_in=60)
        token = url.split("/")[-1]
        
        with pytest.raises(HTTPException) as exc:
            storage_service.validate_token(token)
        assert exc.value.status_code == 403
        assert "Path traversal" in exc.value.detail

    def test_absolute_path_token_rejected(self, storage_service):
        # Generate token with absolute path and valid signature
        file_path = "/etc/passwd"
        url = storage_service.generate_secure_url(file_path, expires_in=60)
        token = url.split("/")[-1]
        
        with pytest.raises(HTTPException) as exc:
            storage_service.validate_token(token)
        assert exc.value.status_code == 403
        assert "Path traversal" in exc.value.detail

class TestStorageIntegration:
    def test_storage_route_access(self):
        from src.main import app
        client = TestClient(app)
        # Unauthorized access or invalid token should return 403
        response = client.get("/storage/files/invalid-token")
        assert response.status_code == 403
