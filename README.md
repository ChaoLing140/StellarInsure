# StellarInsure

> **Parametric insurance protocol on Stellar with automated payouts**

```
  ____  _       _ _          ___                          
 / ___|| |_ ___| | | __ _ _ _|_ _|_ __  ___ _   _ _ __ ___ 
 \___ \| __/ _ \ | |/ _` | '__| || '_ \/ __| | | | '__/ _ \
  ___) | ||  __/ | | (_| | |  | || | | \__ \ |_| | | |  __/
 |____/ \__\___|_|_|\__,_|_| |___|_| |_|___/\__,_|_|  \___|
                                                            
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar%20Soroban-purple)](https://soroban.stellar.org)
[![Backend Coverage](https://img.shields.io/badge/Backend%20Coverage-80%25-green)](#)
[![Frontend Coverage](https://img.shields.io/badge/Frontend%20Coverage-80%25-green)](#)
[![Contract Coverage](https://img.shields.io/badge/Contract%20Coverage-80%25-green)](#)

## The Problem

Traditional insurance has fundamental issues:
- **Slow Claims Processing**: Takes weeks or months for payouts
- **Trust Issues**: Insurers can deny claims arbitrarily
- **High Overhead**: Administrative costs eat into premiums
- **Limited Access**: Many people excluded from coverage
- **Lack of Transparency**: Opaque processes and fine print

## The Solution

StellarInsure is a **parametric insurance protocol** where:
- Payouts are **automatic based on verifiable events**
- Smart contracts eliminate trust requirements
- **Transparent** on-chain policy terms
- **Fast claims** processed in minutes, not weeks
- **Low fees** with minimal overhead

---

## How It Works -

### Parametric Insurance Model

Unlike traditional insurance that requires claim assessment, parametric insurance pays out automatically when predefined conditions are met:

```
Traditional Insurance:
Event → File Claim → Investigation → Assessment → (Maybe) Payout
Time: Weeks to months

Parametric Insurance:
Event → Oracle Verification → Automatic Payout
Time: Minutes to hours
```

### Supported Insurance Types

| Type | Trigger Example | Use Case |
|------|----------------|----------|
| **Weather Insurance** | Temperature < 0°C or Rainfall > 100mm | Crop protection, event cancellation |
| **Flight Delay Insurance** | Flight delayed > 2 hours | Travel protection |
| **Smart Contract Insurance** | Contract exploit detected | DeFi protocol coverage |
| **Asset Insurance** | Asset price drops > 20% | Portfolio protection |
| **Health Events** | Hospital admission | Medical expense coverage |

---

## Features

| Feature | Description |
|---------|-------------|
| **Parametric Policies** | Create policies with automated trigger conditions |
| **Oracle Integration** | Verify real-world events via decentralized oracles |
| **Instant Payouts** | Automatic claims processing when conditions met |
| **Risk Pools** | Liquidity providers earn premiums from underwriting |
| **Multi-Asset Support** | Insure various assets and events |
| **Transparent Terms** | All conditions encoded on-chain |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Create  │  │  Browse  │  │  Submit  │  │Dashboard │       │
│  │  Policy  │  │ Policies │  │  Claim   │  │          │       │
│  └────┬─────┘  └─────┬────┘  └─────┬────┘  └────┬─────┘       │
└───────┼──────────────┼─────────────┼────────────┼──────────────┘
        │              │             │            │
        ▼              ▼             ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SOROBAN SMART CONTRACTS                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  StellarInsure Protocol                   │   │
│  │  • create_policy()     • pay_premium()                    │   │
│  │  • submit_claim()      • process_claim()                  │   │
│  │  • cancel_policy()     • get_policy()                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Risk Pools                            │   │
│  │  • deposit()      • withdraw()    • distribute_premium()  │   │
│  │  • payout()       • get_balance() • calculate_yield()     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORACLE NETWORK                               │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │  Weather   │  │   Flight    │  │  Smart Contract│            │
│  │   Data     │  │   Data      │  │   Monitoring   │            │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘             │
│        └─────────────────┴────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                            │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │  Event     │  │   REST API  │  │  Oracle      │             │
│  │  Indexer   │  │  (FastAPI)  │  │  Relayer     │             │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘             │
│        ▼                ▼                ▼                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            PostgreSQL + Redis Cache                  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Use Cases

### 1. Weather Insurance for Farmers
```
Policy: Protect crop yield against drought
Trigger: Rainfall < 50mm in growing season
Coverage: 10,000 XLM
Premium: 500 XLM
Payout: Automatic when oracle confirms low rainfall
```

### 2. Flight Delay Coverage
```
Policy: Flight delay protection
Trigger: Flight delayed > 2 hours
Coverage: 200 XLM
Premium: 10 XLM
Payout: Automatic using flight tracking API
```

### 3. DeFi Smart Contract Insurance
```
Policy: Protocol exploit protection
Trigger: Security incident detected
Coverage: 100,000 XLM
Premium: 5,000 XLM
Payout: Compensates users for losses
```

### 4. Stablecoin De-peg Insurance
```
Policy: Protect against stablecoin de-pegging
Trigger: USDC price < $0.95
Coverage: 50,000 XLM
Premium: 1,000 XLM
Payout: Automatic when price oracle confirms
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Stellar Soroban (Rust) |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Wallet** | Freighter Wallet Integration |
| **Backend** | FastAPI (Python), PostgreSQL, Redis |
| **Oracles** | Chainlink (future), Custom Oracle Network |
| **Infrastructure** | Docker, Kubernetes |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Rust & Cargo
- Soroban CLI
- Docker & Docker Compose
- Freighter Wallet Extension

### Installation

```bash
# Clone the repository
git clone https://github.com/faithorji/StellarInsure.git
cd StellarInsure

# Setup Smart Contracts
cd smartcontract
cargo build --release --target wasm32-unknown-unknown

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarinsure.wasm \
  --network testnet

# Setup Frontend
cd ../frontend
npm install
npm run dev

# Setup Backend
cd ../backend
pip install -r requirements.txt
python src/main.py
```

---

## Creating a Policy

### Via CLI
```bash
# Create weather insurance policy
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- create_policy \
  --policyholder <ADDRESS> \
  --policy-type Weather \
  --coverage-amount 1000000000 \
  --premium 50000000 \
  --duration 2592000 \
  --trigger-condition "rainfall < 50mm"
```

### Via Web Interface
1. Connect Freighter Wallet
2. Click "Create Policy"
3. Select insurance type
4. Set coverage amount and premium
5. Define trigger conditions
6. Submit and pay premium

---

## Key Concepts

### Policy Types

**Weather Insurance**
- Temperature thresholds
- Rainfall/snowfall measurements
- Wind speed limits
- Natural disaster events

**Flight Insurance**
- Delay duration
- Cancellation events
- Route changes
- Airline-specific policies

**Smart Contract Insurance**
- Exploit detection
- Unusual transaction patterns
- Oracle manipulation
- Protocol failures

### Premium Calculation

Premiums are calculated based on:
```
Premium = Base Rate × Risk Multiplier × Coverage Amount × Duration
```

Factors affecting premium:
- Historical event frequency
- Coverage duration
- Payout amount
- Oracle reliability

### Claim Process

1. **Event Occurs**: Real-world trigger condition met
2. **Oracle Verification**: Decentralized oracles confirm event
3. **Automatic Processing**: Smart contract validates claim
4. **Instant Payout**: Funds transferred to policyholder

---

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Smart Contract Documentation](./docs/SMARTCONTRACT.md)
- [Oracle Integration Guide](./docs/ORACLE.md)
- [API Reference](./docs/API.md)
- [Frontend Guide](./docs/FRONTEND.md)

### Smart contract indexing

The Soroban contracts emit structured events for policy creation, premium payments,
claim submission and processing, policy cancellation, and risk-pool liquidity activity.
See [Smart Contract Documentation](./docs/SMARTCONTRACT.md) for the full event list.

---

## Security

### Audits
- Smart contracts pending audit before mainnet
- Oracle network independently verified
- Risk pool mechanics reviewed by actuaries

### Risk Management
- Policies limited to prevent pool depletion
- Multi-oracle verification reduces manipulation
- Time delays on large payouts for safety

### Bug Bounty
- Coming soon: Bug bounty program
- Report vulnerabilities: security@stellarinsure.io

---

## Roadmap

- [x] Core insurance smart contracts
- [x] Policy creation and management
- [x] Basic claim processing
- [ ] Oracle network integration
- [x] Risk pool liquidity management
- [ ] Frontend MVP
- [ ] Testnet launch
- [ ] Actuarial risk modeling
- [ ] Mainnet launch
- [ ] Mobile app
- [ ] Advanced policy types
- [ ] DAO governance

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Areas Needing Help:**
- Oracle integrations (Chainlink, custom)
- Actuarial modeling and risk assessment
- Frontend UX improvements
- Documentation and tutorials
- Policy type expansions

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Disclaimer

StellarInsure is experimental software under active development. This is not financial advice. Insurance policies are subject to terms and oracle verification. Use at your own risk.

---

*Building trustless, automated insurance for the Stellar ecosystem*
