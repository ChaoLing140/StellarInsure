import pytest


def test_validation_error_returns_structured_errors(client, auth_headers):
    """Test that validation errors return structured field errors"""
    # Send invalid policy creation request (missing required fields)
    response = client.post(
        "/policies/",
        headers=auth_headers,
        json={
            "policy_type": "weather",
            "coverage_amount": -100.0,  # Invalid: negative
            "premium": 50.0,
            # Missing start_time, end_time, trigger_condition
        }
    )
    
    assert response.status_code == 422
    data = response.json()
    
    # Check error structure
    assert "error_code" in data
    assert data["error_code"] == "VAL_001"
    assert "detail" in data
    assert "errors" in data
    assert "timestamp" in data
    
    # Check that errors is a list of structured objects
    assert isinstance(data["errors"], list)
    assert len(data["errors"]) > 0
    
    # Each error should have field, message, and type
    for error in data["errors"]:
        assert "field" in error
        assert "message" in error
        assert "type" in error


def test_validation_error_includes_field_paths(client, auth_headers):
    """Test that validation errors include proper field paths"""
    response = client.post(
        "/policies/",
        headers=auth_headers,
        json={
            "policy_type": "weather",
            "coverage_amount": "not_a_number",  # Invalid type
            "premium": 50.0,
            "start_time": 1000,
            "end_time": 2000,
            "trigger_condition": "test"
        }
    )
    
    assert response.status_code == 422
    data = response.json()
    
    # Find the coverage_amount error
    coverage_errors = [e for e in data["errors"] if "coverage_amount" in e["field"]]
    assert len(coverage_errors) > 0
    
    # Check that field path is properly formatted
    assert coverage_errors[0]["field"] == "body.coverage_amount"


def test_validation_error_preserves_error_code(client, auth_headers):
    """Test that VAL_001 error code is preserved in structured errors"""
    response = client.post(
        "/claims/",
        headers=auth_headers,
        json={
            "policy_id": "not_an_int",  # Invalid type
            "claim_amount": 100.0,
            "proof": "test"
        }
    )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VAL_001"


def test_validation_error_multiple_fields(client, auth_headers):
    """Test that multiple field errors are all returned"""
    response = client.post(
        "/policies/",
        headers=auth_headers,
        json={
            "policy_type": "invalid_type",
            "coverage_amount": -100.0,
            "premium": -50.0,
            "start_time": -1,
            "end_time": -2,
            "trigger_condition": ""
        }
    )
    
    assert response.status_code == 422
    data = response.json()
    
    # Should have multiple errors
    assert len(data["errors"]) >= 3
    
    # Check that different fields are reported
    fields = [e["field"] for e in data["errors"]]
    assert any("coverage_amount" in f for f in fields)
    assert any("premium" in f for f in fields)


def test_validation_error_empty_required_field(client, auth_headers):
    """Test validation error for empty required fields"""
    response = client.post(
        "/claims/",
        headers=auth_headers,
        json={
            "policy_id": 1,
            "claim_amount": 100.0,
            "proof": ""  # Empty proof
        }
    )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VAL_001"
    
    # Find proof error
    proof_errors = [e for e in data["errors"] if "proof" in e["field"]]
    assert len(proof_errors) > 0
