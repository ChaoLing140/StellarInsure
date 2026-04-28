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
