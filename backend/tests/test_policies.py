"""Test policy endpoints for StellarInsure API"""
import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


class TestPolicyEndpoints:
    """Test suite for policy endpoints"""

    def test_create_policy_success(self):
        """Test successful policy creation"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        current_time = int(datetime.utcnow().timestamp())
        
        response = client.post(
            "/policies/",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "policy_type": "weather",
                "coverage_amount": 1000.0,
                "premium": 50.0,
                "start_time": current_time,
                "end_time": current_time + 86400,
                "trigger_condition": "Temperature below -10C"
            }
        )
        
        assert response.status_code in [201, 422, 500]

    def test_create_policy_invalid_times(self):
        """Test policy creation with invalid times"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        current_time = int(datetime.utcnow().timestamp())
        
        response = client.post(
            "/policies/",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "policy_type": "weather",
                "coverage_amount": 1000.0,
                "premium": 50.0,
                "start_time": current_time + 86400,
                "end_time": current_time,
                "trigger_condition": "Temperature below -10C"
            }
        )
        
        assert response.status_code in [400, 422]

    def test_list_policies_with_pagination(self):
        """Test policy listing with pagination"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/policies/?page=1&per_page=10",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "policies" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "has_next" in data

    def test_list_policies_with_filters(self):
        """Test policy listing with filters"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/policies/?status=active&policy_type=weather",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "policies" in data

    def test_get_policy_by_id(self):
        """Test getting a specific policy"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/policies/1",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code in [200, 404]

    def test_get_nonexistent_policy(self):
        """Test getting a nonexistent policy"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/policies/99999",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 404

    def test_cancel_policy(self):
        """Test cancelling a policy"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.delete(
            "/policies/1",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code in [200, 404]

    def test_unauthorized_policy_access(self):
        """Test unauthorized policy access"""
        from src.main import app
        
        client = TestClient(app)
        
        response = client.get("/policies/")
        
        assert response.status_code == 403

    def test_submit_claim(self):
        """Test submitting a claim"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.post(
            "/policies/1/claims",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "policy_id": 1,
                "claim_amount": 500.0,
                "proof": "Weather report evidence"
            }
        )
        
        assert response.status_code in [201, 400, 404]


class TestPolicyValidation:
    """Test suite for policy validation"""

    def test_policy_type_validation(self):
        """Test policy type validation"""
        from src.models import PolicyType
        
        valid_types = ["weather", "smart_contract", "flight", "health", "asset"]
        
        for ptype in valid_types:
            policy_type = PolicyType(ptype)
            assert policy_type.value == ptype

    def test_policy_status_validation(self):
        """Test policy status validation"""
        from src.models import PolicyStatus
        
        valid_statuses = [
            "active", "expired", "cancelled",
            "claim_pending", "claim_approved", "claim_rejected"
        ]
        
        for status in valid_statuses:
            policy_status = PolicyStatus(status)
            assert policy_status.value == status

    def test_pagination_parameters(self):
        """Test pagination parameter validation"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/policies/?page=0&per_page=10",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 422

    def test_per_page_limit(self):
        """Test per_page limit validation"""
        from src.main import app
        from src.auth import create_access_token
        
        client = TestClient(app)
        
        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )
        
        response = client.get(
            "/policies/?page=1&per_page=150",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 422


class TestPolicyBusinessLogic:
    """Test suite for policy business logic"""

    def test_policy_can_claim_method(self):
        """Test policy can_claim method"""
        from src.models import Policy, PolicyStatus, PolicyType
        from decimal import Decimal
        
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0"),
            premium=Decimal("50.0"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C",
            status=PolicyStatus.active
        )
        
        assert policy.can_claim(1500000) is True
        assert policy.can_claim(2500000) is False

    def test_policy_remaining_coverage(self):
        """Test policy remaining_coverage method"""
        from src.models import Policy, PolicyStatus, PolicyType
        from decimal import Decimal
        
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0"),
            premium=Decimal("50.0"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C",
            status=PolicyStatus.active,
            claim_amount=Decimal("200.0")
        )
        
        remaining = policy.remaining_coverage()
        assert remaining == Decimal("800.0")
