import pytest
from datetime import datetime, timedelta
from src.models import Transaction


def test_get_transactions_returns_user_transactions(client, authenticated_user, db_session):
    """Test that GET /transactions returns transactions for authenticated user"""
    user, headers = authenticated_user
    
    # Create test transactions
    tx1 = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="successful"
    )
    tx2 = Transaction(
        user_id=user.id,
        transaction_hash="hash2",
        amount=500.0,
        transaction_type="payout",
        status="successful"
    )
    db_session.add_all([tx1, tx2])
    db_session.commit()
    
    response = client.get("/transactions", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["transactions"]) == 2
    assert data["page"] == 1
    assert data["per_page"] == 10


def test_get_transactions_pagination(client, authenticated_user, db_session):
    """Test pagination works correctly"""
    user, headers = authenticated_user
    
    # Create 15 transactions
    for i in range(15):
        tx = Transaction(
            user_id=user.id,
            transaction_hash=f"hash{i}",
            amount=100.0 + i,
            transaction_type="premium",
            status="successful"
        )
        db_session.add(tx)
    db_session.commit()
    
    # Get first page
    response = client.get("/transactions?page=1&per_page=10", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["transactions"]) == 10
    assert data["has_next"] is True
    
    # Get second page
    response = client.get("/transactions?page=2&per_page=10", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["transactions"]) == 5
    assert data["has_next"] is False


def test_get_transactions_filter_by_type(client, authenticated_user, db_session):
    """Test filtering by transaction type"""
    user, headers = authenticated_user
    
    tx1 = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="successful"
    )
    tx2 = Transaction(
        user_id=user.id,
        transaction_hash="hash2",
        amount=500.0,
        transaction_type="payout",
        status="successful"
    )
    db_session.add_all([tx1, tx2])
    db_session.commit()
    
    response = client.get("/transactions?transaction_type=premium", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["transactions"][0]["transaction_type"] == "premium"


def test_get_transactions_filter_by_status(client, authenticated_user, db_session):
    """Test filtering by status"""
    user, headers = authenticated_user
    
    tx1 = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="pending"
    )
    tx2 = Transaction(
        user_id=user.id,
        transaction_hash="hash2",
        amount=500.0,
        transaction_type="payout",
        status="successful"
    )
    db_session.add_all([tx1, tx2])
    db_session.commit()
    
    response = client.get("/transactions?status=successful", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["transactions"][0]["status"] == "successful"


def test_get_transactions_filter_by_date_range(client, authenticated_user, db_session):
    """Test filtering by date range"""
    user, headers = authenticated_user
    
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    
    tx1 = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="successful",
        created_at=yesterday
    )
    tx2 = Transaction(
        user_id=user.id,
        transaction_hash="hash2",
        amount=500.0,
        transaction_type="payout",
        status="successful",
        created_at=now
    )
    db_session.add_all([tx1, tx2])
    db_session.commit()
    
    # Filter for today's transactions
    start_date = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    response = client.get(f"/transactions?start_date={start_date}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1


def test_get_transactions_requires_authentication(client):
    """Test that endpoint requires authentication"""
    response = client.get("/transactions")
    assert response.status_code == 401


def test_get_transactions_only_returns_user_own_transactions(client, authenticated_user, user_factory, db_session):
    """Test that users can only see their own transactions"""
    user, headers = authenticated_user
    other_user = user_factory("GOTHER123456789012345678901234567890123456789012345678")
    
    # Create transaction for authenticated user
    tx1 = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="successful"
    )
    # Create transaction for other user
    tx2 = Transaction(
        user_id=other_user.id,
        transaction_hash="hash2",
        amount=500.0,
        transaction_type="payout",
        status="successful"
    )
    db_session.add_all([tx1, tx2])
    db_session.commit()
    
    response = client.get("/transactions", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["transactions"][0]["user_id"] == user.id


def test_get_transactions_rejects_invalid_date_range(client, authenticated_user, db_session):
    """Test that reversed date ranges are rejected with 422"""
    user, headers = authenticated_user
    
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    
    # Try to query with end_date before start_date
    start_date = now.isoformat()
    end_date = yesterday.isoformat()
    
    response = client.get(
        f"/transactions?start_date={start_date}&end_date={end_date}",
        headers=headers
    )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VAL_002"
    assert "end_date must be greater than or equal to start_date" in data["detail"]


def test_get_transactions_accepts_valid_date_ranges(client, authenticated_user, db_session):
    """Test that valid date ranges work correctly"""
    user, headers = authenticated_user
    
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    
    tx = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="successful",
        created_at=now
    )
    db_session.add(tx)
    db_session.commit()
    
    # Test with valid range
    start_date = yesterday.isoformat()
    end_date = now.isoformat()
    
    response = client.get(
        f"/transactions?start_date={start_date}&end_date={end_date}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1


def test_get_transactions_accepts_equal_dates(client, authenticated_user, db_session):
    """Test that equal start and end dates are accepted"""
    user, headers = authenticated_user
    
    now = datetime.utcnow()
    
    # Test with equal dates
    date_str = now.isoformat()
    
    response = client.get(
        f"/transactions?start_date={date_str}&end_date={date_str}",
        headers=headers
    )
    
    assert response.status_code == 200


def test_get_transactions_accepts_one_sided_date_filters(client, authenticated_user, db_session):
    """Test that one-sided date filters work correctly"""
    user, headers = authenticated_user
    
    now = datetime.utcnow()
    
    tx = Transaction(
        user_id=user.id,
        transaction_hash="hash1",
        amount=100.0,
        transaction_type="premium",
        status="successful",
        created_at=now
    )
    db_session.add(tx)
    db_session.commit()
    
    # Test with only start_date
    response = client.get(
        f"/transactions?start_date={now.isoformat()}",
        headers=headers
    )
    assert response.status_code == 200
    
    # Test with only end_date
    response = client.get(
        f"/transactions?end_date={now.isoformat()}",
        headers=headers
    )
    assert response.status_code == 200


def test_get_transactions_includes_total_pages(client, authenticated_user, db_session):
    """Test that total_pages is included in response"""
    user, headers = authenticated_user
    
    # Create 25 transactions
    for i in range(25):
        tx = Transaction(
            user_id=user.id,
            transaction_hash=f"hash{i}",
            amount=100.0 + i,
            transaction_type="premium",
            status="successful"
        )
        db_session.add(tx)
    db_session.commit()
    
    # Test with per_page=10
    response = client.get("/transactions?page=1&per_page=10", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_pages" in data
    assert data["total_pages"] == 3  # 25 items / 10 per page = 3 pages
    assert data["total"] == 25
    
    # Test with per_page=7 (non-divisible)
    response = client.get("/transactions?page=1&per_page=7", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 4  # 25 items / 7 per page = 4 pages (rounded up)


def test_get_transactions_total_pages_empty_result(client, authenticated_user, db_session):
    """Test that total_pages is 0 for empty results"""
    user, headers = authenticated_user
    
    response = client.get("/transactions", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 0
    assert data["total"] == 0

