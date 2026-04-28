# StellarInsure Architecture

## System Overview

StellarInsure is a parametric insurance protocol built on Stellar Soroban that enables automated, trustless insurance policies with instant payouts based on verifiable events. The system consists of smart contracts, a backend API, a frontend application, and oracle integrations.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 14 Application (TypeScript + Tailwind CSS)      │   │
│  │  - Policy Management UI                                  │   │
│  │  - Claim Submission Interface                            │   │
│  │  - Risk Pool Dashboard                                   │   │
│  │  - Freighter Wallet Integration                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FastAPI REST API (Python)                               │   │
│  │  - Policy indexing and caching                           │   │
│  │  - Event processing                                      │   │
│  │  - Oracle data relay                                     │   │
│  │  - Webhook notifications                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                     │   │
│  │  - Policy records                                        │   │
│  │  - Claim history                                         │   │
│  │  - User accounts                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Redis Cache                                             │   │
│  │  - Rate limiting                                         │   │
│  │  - Session management                                    │   │
│  │  - Query result caching                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Stellar Soroban Smart Contracts (Rust)                  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  StellarInsure Contract                            │  │   │
│  │  │  - create_policy()                                 │  │   │
│  │  │  - pay_premium()                                   │  │   │
│  │  │  - submit_claim()                                  │  │   │
│  │  │  - process_claim() / vote_claim()                 │  │   │
│  │  │  - cancel_policy()                                 │  │   │
│  │  │  - renew_policy()                                  │  │   │
│  │  │  - increase_coverage()                             │  │   │
│  │  │  - extend_duration()                               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  RiskPool Contract                                 │  │   │
│  │  │  - add_liquidity()                                 │  │   │
│  │  │  - withdraw_liquidity()                            │  │   │
│  │  │  - distribute_yield()                              │  │   │
│  │  │  - claim_yield()                                   │  │   │
│  │  │  - fund_payout()                                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORACLE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Oracle Network (Future Integration)                     │   │
│  │  - Weather data feeds                                    │   │
│  │  - Flight status APIs                                    │   │
│  │  - Smart contract monitoring                             │   │
│  │  - Asset price feeds                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Policy Creation Flow

```
1. User connects Freighter Wallet
   │
   ▼
2. Frontend calls calculate_premium() (read-only)
   │
   ▼
3. User reviews premium and confirms
   │
   ▼
4. Frontend calls create_policy() with calculated premium
   │
   ▼
5. Smart contract verifies premium matches calculation
   │
   ▼
6. Policy created, event emitted
   │
   ▼
7. Backend indexes event, stores in PostgreSQL
   │
   ▼
8. Frontend displays policy details
```

### Premium Payment Flow

```
1. User initiates premium payment
   │
   ▼
2. Frontend calls pay_premium() with policy_id
   │
   ▼
3. Smart contract transfers tokens from user to risk pool
   │
   ▼
4. Risk pool distributes yield to liquidity providers
   │
   ▼
5. Premium paid event emitted
   │
   ▼
6. Backend updates policy status
```

### Claim Submission and Processing Flow

```
1. User submits claim with proof
   │
   ▼
2. Frontend calls submit_claim()
   │
   ▼
3. Smart contract validates claim amount and policy status
   │
   ▼
4. Claim status set to pending
   │
   ▼
5. Multi-sig admins vote on claim via vote_claim()
   │
   ▼
6. When threshold reached, automatic payout triggered
   │
   ▼
7. Risk pool transfers funds to policyholder
   │
   ▼
8. Payout event emitted
   │
   ▼
9. Backend updates claim status and sends webhook notification
```

## Smart Contract Design

### StellarInsure Contract

The main insurance protocol contract manages policy lifecycle and claim processing.

**Key Features:**
- Policy creation with premium verification
- Multi-signature admin voting for claim approval
- Policy modification (coverage increase, duration extension)
- Policy renewal with grace period
- Emergency pause mechanism
- Configurable policy count limits

**Storage:**
- Policies indexed by policy_id
- Claims indexed by policy_id
- Admin list and voting threshold
- Policy counter with configurable maximum
- Premium token address
- Risk pool address

### RiskPool Contract

Manages liquidity provider funds and yield distribution.

**Key Features:**
- Liquidity deposit and withdrawal
- Yield distribution to providers
- Payout funding with reserve protection
- Configurable reserve ratio for pending claims

**Storage:**
- Provider positions (contribution + accrued yield)
- Total liquidity
- Total yield distributed
- Reserve ratio (default 20%)

## Security Model

### Access Control

1. **Admin Functions:**
   - Multi-signature voting for claim approval
   - Configurable approval threshold
   - Admin addition/removal requires existing admin

2. **User Functions:**
   - Policy operations require policyholder authentication
   - Premium payments verified against calculated amounts
   - Claim submissions validated for policy status

3. **Emergency Controls:**
   - Pause/unpause mechanism for critical issues
   - Only admin can pause contract
   - Paused state blocks policy creation, premium payment, claims

### Economic Security

1. **Premium Verification:**
   - All premiums calculated using actuarial formula
   - Create policy enforces premium matches calculation
   - Prevents underpayment attacks

2. **Risk Pool Protection:**
   - Reserve ratio prevents liquidity drain
   - Withdrawals blocked if they would impair pending claims
   - Configurable reserve percentage (default 20%)

3. **Policy Limits:**
   - Maximum policy count prevents storage exhaustion
   - Admin-configurable limit (default 1,000,000)
   - Clear error when limit reached

## Deployment Architecture

### Development Environment

```
docker-compose.dev.yml
├── frontend (Next.js dev server)
├── backend (FastAPI with hot reload)
├── postgres (development database)
└── redis (cache and rate limiting)
```

### Staging Environment

Kubernetes deployment with:
- Frontend and backend pods with HPA
- PostgreSQL StatefulSet
- Redis StatefulSet
- Ingress with TLS
- ConfigMaps for environment variables

### Production Environment

Same as staging with:
- Increased replica counts
- Production-grade resource limits
- Enhanced monitoring and logging
- Backup and disaster recovery

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Smart Contracts | Rust + Soroban SDK | On-chain logic |
| Backend API | Python + FastAPI | Event indexing, caching |
| Database | PostgreSQL | Persistent storage |
| Cache | Redis | Rate limiting, sessions |
| Frontend | Next.js 14 + TypeScript | User interface |
| Styling | Tailwind CSS | UI components |
| Wallet | Freighter | Stellar wallet integration |
| Infrastructure | Docker + Kubernetes | Deployment |

## Event System

All state-changing operations emit Soroban events for off-chain indexing:

- `("policy", "created")` - New policy created
- `("policy", "premium")` - Premium paid
- `("claim", "submit")` - Claim submitted
- `("claim", "process")` - Claim approved/rejected
- `("claim", "vote")` - Admin vote cast
- `("policy", "cancel")` - Policy cancelled
- `("policy", "renewed")` - Policy renewed
- `("pool", "deposit")` - Liquidity added
- `("pool", "withdraw")` - Liquidity withdrawn
- `("pool", "yield")` - Yield distributed

The backend listens for these events and updates the PostgreSQL database accordingly.

## Scalability Considerations

1. **Smart Contract:**
   - Policy counter with configurable maximum
   - Efficient storage using persistent and instance storage
   - Event-driven architecture for off-chain indexing

2. **Backend:**
   - Redis caching for frequently accessed data
   - Connection pooling for database efficiency
   - Rate limiting to prevent abuse

3. **Frontend:**
   - Server-side rendering for performance
   - Static generation for public pages
   - Client-side caching of blockchain data

## Future Enhancements

1. **Oracle Integration:**
   - Chainlink price feeds
   - Weather data APIs
   - Flight status verification
   - Smart contract exploit detection

2. **Governance:**
   - DAO-based protocol governance
   - Community voting on parameters
   - Treasury management

3. **Advanced Features:**
   - Cross-chain insurance
   - Reinsurance pools
   - Automated market makers for premiums
   - NFT-based policy certificates
