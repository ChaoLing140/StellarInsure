# API Reference

## Overview

The StellarInsure backend provides a REST API for querying indexed policy data, managing user accounts, and receiving webhook notifications. The API is built with FastAPI and includes automatic OpenAPI documentation.

**Base URL:** `http://localhost:8000` (development)

**API Documentation:** `http://localhost:8000/docs` (Swagger UI)

## Authentication

### JWT Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Flow

```
1. User connects Freighter Wallet
   ↓
2. Frontend requests challenge message from backend
   ↓
3. User signs challenge with wallet
   ↓
4. Frontend sends signed message to /auth/login
   ↓
5. Backend verifies signature and returns JWT
   ↓
6. Frontend includes JWT in subsequent requests
```

## Endpoints

### Authentication

#### POST /auth/challenge

Generate a challenge message for wallet signature.

**Request Body:**
```json
{
  "public_key": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**Response:**
```json
{
  "challenge": "Sign this message to authenticate: 1234567890",
  "expires_at": "2026-04-27T12:00:00Z"
}
```

#### POST /auth/login

Authenticate with signed challenge.

**Request Body:**
```json
{
  "public_key": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "signature": "base64_encoded_signature",
  "challenge": "Sign this message to authenticate: 1234567890"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Error Codes:**
- `401` - Invalid signature or expired challenge
- `400` - Missing required fields

### Policies

#### GET /policies

List all policies for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (active, expired, cancelled, claim_pending)
- `policy_type` (optional): Filter by type (weather, flight, smart_contract, health, asset)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "policies": [
    {
      "id": 1,
      "policyholder": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "beneficiary": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "policy_type": "weather",
      "coverage_amount": "10000000000",
      "premium": "500000000",
      "start_time": 1714204800,
      "end_time": 1716796800,
      "trigger_condition": "rainfall < 50mm",
      "status": "active",
      "claim_amount": "0",
      "created_at": "2026-04-27T10:00:00Z",
      "updated_at": "2026-04-27T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### GET /policies/{policy_id}

Get details for a specific policy.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "policyholder": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "beneficiary": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "policy_type": "weather",
  "coverage_amount": "10000000000",
  "premium": "500000000",
  "start_time": 1714204800,
  "end_time": 1716796800,
  "trigger_condition": "rainfall < 50mm",
  "status": "active",
  "claim_amount": "0",
  "created_at": "2026-04-27T10:00:00Z",
  "updated_at": "2026-04-27T10:00:00Z"
}
```

**Error Codes:**
- `404` - Policy not found
- `403` - Not authorized to view this policy

#### POST /policies/calculate-premium

Calculate premium for a prospective policy.

**Request Body:**
```json
{
  "policy_type": "weather",
  "coverage_amount": "10000000000",
  "duration_seconds": 2592000
}
```

**Response:**
```json
{
  "premium": "500000000",
  "policy_type": "weather",
  "coverage_amount": "10000000000",
  "duration_seconds": 2592000,
  "annual_rate_bps": 350
}
```

### Claims

#### GET /claims

List all claims for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by approval status (pending, approved, rejected)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "claims": [
    {
      "policy_id": 1,
      "claim_amount": "5000000000",
      "proof": "Weather station data showing rainfall < 50mm",
      "timestamp": 1714291200,
      "approved": false,
      "status": "pending",
      "created_at": "2026-04-28T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### GET /claims/{policy_id}

Get claim details for a specific policy.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "policy_id": 1,
  "claim_amount": "5000000000",
  "proof": "Weather station data showing rainfall < 50mm",
  "timestamp": 1714291200,
  "approved": false,
  "status": "pending",
  "votes": {
    "approvals": 2,
    "rejections": 0,
    "threshold": 3
  },
  "created_at": "2026-04-28T10:00:00Z"
}
```

### Risk Pool

#### GET /pool/stats

Get risk pool statistics.

**Response:**
```json
{
  "total_liquidity": "100000000000000",
  "total_yield_distributed": "5000000000000",
  "provider_count": 42,
  "reserve_ratio": 2000,
  "available_liquidity": "80000000000000"
}
```

#### GET /pool/providers/{address}

Get provider position details.

**Response:**
```json
{
  "provider": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "contribution": "10000000000000",
  "accrued_yield": "500000000000",
  "share_percentage": "10.00"
}
```

### Treasury

#### GET /treasury/stats

Get overall treasury statistics.

**Response:**
```json
{
  "total_premium_collected": "50000000000000",
  "total_payouts_distributed": "30000000000000",
  "current_balance": "20000000000000",
  "active_policies": 156,
  "total_policies": 200
}
```

### Webhooks

#### POST /webhooks

Register a webhook endpoint for event notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["policy.created", "claim.submitted", "claim.processed"],
  "secret": "your_webhook_secret"
}
```

**Response:**
```json
{
  "id": "webhook_123",
  "url": "https://your-domain.com/webhook",
  "events": ["policy.created", "claim.submitted", "claim.processed"],
  "created_at": "2026-04-27T10:00:00Z",
  "active": true
}
```

#### GET /webhooks

List registered webhooks for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "webhooks": [
    {
      "id": "webhook_123",
      "url": "https://your-domain.com/webhook",
      "events": ["policy.created", "claim.submitted"],
      "active": true,
      "created_at": "2026-04-27T10:00:00Z"
    }
  ]
}
```

#### DELETE /webhooks/{webhook_id}

Delete a webhook.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Webhook deleted successfully"
}
```

### Webhook Event Payloads

When events occur, the backend sends POST requests to registered webhook URLs.

**Headers:**
```
X-Webhook-Signature: sha256=<hmac_signature>
Content-Type: application/json
```

**Policy Created Event:**
```json
{
  "event": "policy.created",
  "timestamp": "2026-04-27T10:00:00Z",
  "data": {
    "policy_id": 1,
    "policyholder": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "policy_type": "weather",
    "coverage_amount": "10000000000",
    "premium": "500000000"
  }
}
```

**Claim Submitted Event:**
```json
{
  "event": "claim.submitted",
  "timestamp": "2026-04-28T10:00:00Z",
  "data": {
    "policy_id": 1,
    "claim_amount": "5000000000",
    "proof": "Weather station data"
  }
}
```

**Claim Processed Event:**
```json
{
  "event": "claim.processed",
  "timestamp": "2026-04-28T12:00:00Z",
  "data": {
    "policy_id": 1,
    "approved": true,
    "payout_amount": "5000000000"
  }
}
```

## Error Codes

The API uses standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_PREMIUM",
    "message": "Premium does not match calculated amount",
    "details": {
      "provided": "400000000",
      "required": "500000000"
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Anonymous requests:** 100 requests per hour
- **Authenticated requests:** 1000 requests per hour
- **Webhook deliveries:** 10 retries with exponential backoff

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1714208400
```

## Pagination

List endpoints support pagination using `limit` and `offset` parameters:

```
GET /policies?limit=20&offset=40
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "total": 156,
  "limit": 20,
  "offset": 40,
  "has_more": true
}
```

## CORS

The API supports CORS for browser-based applications. Allowed origins are configurable via environment variables.

**Development:** All origins allowed
**Production:** Whitelist specific domains

## WebSocket Support

Real-time updates are available via WebSocket connection:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.event, data.data);
};
```

**Supported Events:**
- `policy.created`
- `policy.updated`
- `claim.submitted`
- `claim.processed`
- `pool.deposit`
- `pool.withdraw`

## SDK Examples

### JavaScript/TypeScript

```typescript
import { StellarInsureAPI } from '@stellarinsure/sdk';

const api = new StellarInsureAPI({
  baseURL: 'http://localhost:8000',
  token: 'your_jwt_token'
});

// List policies
const policies = await api.policies.list({ status: 'active' });

// Calculate premium
const premium = await api.policies.calculatePremium({
  policy_type: 'weather',
  coverage_amount: '10000000000',
  duration_seconds: 2592000
});

// Get pool stats
const stats = await api.pool.getStats();
```

### Python

```python
from stellarinsure import StellarInsureClient

client = StellarInsureClient(
    base_url='http://localhost:8000',
    token='your_jwt_token'
)

# List policies
policies = client.policies.list(status='active')

# Calculate premium
premium = client.policies.calculate_premium(
    policy_type='weather',
    coverage_amount=10000000000,
    duration_seconds=2592000
)

# Get pool stats
stats = client.pool.get_stats()
```

## Testing

Use the interactive API documentation at `/docs` to test endpoints directly in your browser.

For automated testing, use the provided Postman collection or OpenAPI spec to generate client code.
