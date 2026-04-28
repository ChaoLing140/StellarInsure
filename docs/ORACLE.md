# Oracle Integration Guide

## Overview

StellarInsure uses oracles to verify real-world events and trigger automated claim payouts. The oracle system provides trustless verification of parametric insurance conditions without requiring manual claim assessment.

## Oracle Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    External Data Sources                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Weather  │  │  Flight  │  │  Price   │  │ Contract │   │
│  │   APIs   │  │   APIs   │  │  Feeds   │  │ Monitors │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Oracle Network                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Oracle Aggregator                                   │   │
│  │  - Collects data from multiple sources               │   │
│  │  - Validates and aggregates responses                │   │
│  │  - Calculates consensus value                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Oracle Nodes                                        │   │
│  │  - Independent data providers                        │   │
│  │  - Cryptographic signing of data                     │   │
│  │  - Reputation and staking system                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                   StellarInsure Backend                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Oracle Relay Service                                │   │
│  │  - Monitors oracle updates                           │   │
│  │  - Validates signatures                              │   │
│  │  - Submits verified data to smart contracts          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Soroban Smart Contracts                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Oracle Verification Functions                       │   │
│  │  - verify_oracle_condition()                         │   │
│  │  - Checks trigger conditions against oracle data     │   │
│  │  - Automatically processes claims when met           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Oracle Types

### Weather Oracle

Provides meteorological data for weather-based insurance policies.

**Data Sources:**
- NOAA (National Oceanic and Atmospheric Administration)
- OpenWeatherMap API
- Weather Underground
- Local weather stations

**Supported Parameters:**
- Temperature (Celsius/Fahrenheit)
- Rainfall (mm)
- Snowfall (cm)
- Wind speed (km/h, mph)
- Humidity (%)
- Atmospheric pressure (hPa)

**Example Trigger Conditions:**
```rust
// Temperature below freezing
"temperature < 0°C"

// Heavy rainfall
"rainfall > 100mm in 24h"

// Hurricane-force winds
"wind_speed > 120km/h"

// Drought conditions
"rainfall < 50mm in 30 days"
```

**Data Format:**
```json
{
  "oracle_type": "weather",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "city": "New York"
  },
  "timestamp": 1714204800,
  "data": {
    "temperature": -2.5,
    "rainfall_24h": 0.0,
    "wind_speed": 15.3,
    "humidity": 65
  },
  "sources": [
    {
      "provider": "NOAA",
      "confidence": 0.95
    },
    {
      "provider": "OpenWeatherMap",
      "confidence": 0.92
    }
  ],
  "signature": "0x..."
}
```

### Flight Oracle

Tracks flight status for travel insurance policies.

**Data Sources:**
- FlightAware API
- FlightRadar24
- Airline APIs
- Airport status feeds

**Supported Parameters:**
- Departure delay (minutes)
- Arrival delay (minutes)
- Cancellation status
- Diversion status
- Gate changes

**Example Trigger Conditions:**
```rust
// Flight delayed over 2 hours
"delay > 120 minutes"

// Flight cancelled
"status == cancelled"

// Missed connection
"arrival_delay > 60 AND connection_time < 90"
```

**Data Format:**
```json
{
  "oracle_type": "flight",
  "flight": {
    "number": "AA123",
    "airline": "American Airlines",
    "origin": "JFK",
    "destination": "LAX",
    "scheduled_departure": 1714204800,
    "scheduled_arrival": 1714226400
  },
  "timestamp": 1714204800,
  "data": {
    "status": "delayed",
    "actual_departure": 1714212000,
    "delay_minutes": 120,
    "reason": "weather"
  },
  "sources": [
    {
      "provider": "FlightAware",
      "confidence": 0.98
    }
  ],
  "signature": "0x..."
}
```

### Smart Contract Oracle

Monitors blockchain events for DeFi insurance.

**Data Sources:**
- Blockchain explorers
- Smart contract event logs
- Security monitoring services
- Exploit detection systems

**Supported Parameters:**
- Contract exploit detected
- Unusual transaction volume
- Price manipulation
- Reentrancy attacks
- Access control violations

**Example Trigger Conditions:**
```rust
// Exploit detected
"exploit_detected == true"

// Large unauthorized withdrawal
"unauthorized_withdrawal > 1000000 XLM"

// Oracle manipulation
"price_deviation > 10%"
```

**Data Format:**
```json
{
  "oracle_type": "smart_contract",
  "contract": {
    "address": "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "network": "stellar-mainnet"
  },
  "timestamp": 1714204800,
  "data": {
    "event_type": "exploit_detected",
    "severity": "critical",
    "affected_value": "5000000000000",
    "transaction_hash": "abc123..."
  },
  "sources": [
    {
      "provider": "CertiK",
      "confidence": 0.99
    }
  ],
  "signature": "0x..."
}
```

### Asset Price Oracle

Provides cryptocurrency and asset price data.

**Data Sources:**
- Stellar DEX
- Centralized exchanges (Binance, Coinbase)
- Price aggregators (CoinGecko, CoinMarketCap)
- DeFi protocols

**Supported Parameters:**
- Current price
- 24h price change
- Volume
- Market cap
- Price volatility

**Example Trigger Conditions:**
```rust
// Price drop protection
"price_drop > 20%"

// Stablecoin de-peg
"usdc_price < 0.95"

// Volatility spike
"volatility > 50%"
```

**Data Format:**
```json
{
  "oracle_type": "asset_price",
  "asset": {
    "symbol": "XLM",
    "name": "Stellar Lumens"
  },
  "timestamp": 1714204800,
  "data": {
    "price_usd": 0.12,
    "change_24h": -5.2,
    "volume_24h": 150000000,
    "volatility": 12.5
  },
  "sources": [
    {
      "provider": "Stellar DEX",
      "price": 0.1205,
      "confidence": 0.95
    },
    {
      "provider": "Binance",
      "price": 0.1198,
      "confidence": 0.97
    }
  ],
  "signature": "0x..."
}
```

## Oracle Integration

### Smart Contract Integration

The StellarInsure contract includes oracle verification functions:

```rust
pub fn verify_oracle_condition(
    env: Env,
    oracle_type: Symbol,
    parameter: Symbol,
) -> Result<OracleResult, Error>
```

**Usage Example:**
```rust
// Verify weather condition
let result = contract.verify_oracle_condition(
    &env,
    symbol_short!("Weather"),
    symbol_short!("temp")
);

if result.condition_met {
    // Automatically process claim
    contract.process_claim(&env, policy_id, true)?;
}
```

### Backend Oracle Relay

The backend service monitors oracle updates and relays verified data to smart contracts.

**Configuration:**
```python
# backend/src/config.py
ORACLE_CONFIG = {
    "weather": {
        "providers": ["NOAA", "OpenWeatherMap"],
        "update_interval": 3600,  # 1 hour
        "min_confidence": 0.90
    },
    "flight": {
        "providers": ["FlightAware"],
        "update_interval": 300,  # 5 minutes
        "min_confidence": 0.95
    },
    "smart_contract": {
        "providers": ["CertiK", "PeckShield"],
        "update_interval": 60,  # 1 minute
        "min_confidence": 0.99
    }
}
```

**Oracle Relay Service:**
```python
class OracleRelayService:
    async def monitor_policies(self):
        """Monitor active policies and check oracle conditions"""
        active_policies = await self.get_active_policies()
        
        for policy in active_policies:
            oracle_data = await self.fetch_oracle_data(
                policy.policy_type,
                policy.trigger_condition
            )
            
            if self.condition_met(oracle_data, policy.trigger_condition):
                await self.submit_claim(policy.id, oracle_data)
    
    async def fetch_oracle_data(self, oracle_type, condition):
        """Fetch and aggregate data from multiple oracle sources"""
        providers = ORACLE_CONFIG[oracle_type]["providers"]
        responses = []
        
        for provider in providers:
            data = await self.query_provider(provider, condition)
            if data.confidence >= ORACLE_CONFIG[oracle_type]["min_confidence"]:
                responses.append(data)
        
        return self.aggregate_responses(responses)
```

## Data Feed Specifications

### Update Frequency

| Oracle Type | Update Interval | Latency |
|-------------|----------------|---------|
| Weather | 1 hour | < 5 minutes |
| Flight | 5 minutes | < 1 minute |
| Smart Contract | 1 minute | < 30 seconds |
| Asset Price | 1 minute | < 10 seconds |

### Data Validation

All oracle data must pass validation checks:

1. **Signature Verification:**
   - Cryptographic signature from trusted oracle node
   - Public key registered on-chain

2. **Timestamp Validation:**
   - Data must be recent (within acceptable staleness window)
   - Prevents replay attacks

3. **Consensus Mechanism:**
   - Aggregate responses from multiple providers
   - Require minimum number of confirmations
   - Outlier detection and removal

4. **Confidence Scoring:**
   - Each data point includes confidence score
   - Minimum confidence threshold enforced
   - Higher confidence for critical decisions

### Oracle Node Requirements

To become an oracle node provider:

1. **Staking:**
   - Stake minimum amount of XLM as collateral
   - Slashing for incorrect or malicious data

2. **Reputation:**
   - Track record of accurate data provision
   - Uptime and response time metrics

3. **Infrastructure:**
   - Reliable data sources
   - Low-latency API endpoints
   - Cryptographic key management

4. **Registration:**
   - Register public key on-chain
   - Specify supported oracle types
   - Set pricing for data provision

## Security Considerations

### Oracle Manipulation Prevention

1. **Multiple Data Sources:**
   - Aggregate data from 3+ independent providers
   - Require consensus among majority

2. **Economic Incentives:**
   - Oracle nodes stake collateral
   - Rewards for accurate data
   - Penalties for incorrect data

3. **Time-Weighted Average:**
   - Use TWAP for price oracles
   - Prevents flash loan attacks

4. **Circuit Breakers:**
   - Pause system if oracle data anomalies detected
   - Admin intervention for suspicious activity

### Data Privacy

For sensitive data (health records, personal information):

1. **Zero-Knowledge Proofs:**
   - Prove condition met without revealing data
   - Preserve user privacy

2. **Encrypted Data Feeds:**
   - End-to-end encryption
   - Only authorized parties can decrypt

3. **Selective Disclosure:**
   - Reveal only necessary information
   - Minimize data exposure

## Future Enhancements

### Chainlink Integration

Integration with Chainlink oracle network for:
- Decentralized price feeds
- Weather data
- Sports results
- Random number generation

**Example Integration:**
```rust
use chainlink_soroban::PriceFeed;

pub fn get_xlm_price(env: &Env) -> i128 {
    let price_feed = PriceFeed::new(env, &CHAINLINK_XLM_USD_FEED);
    price_feed.latest_answer()
}
```

### Custom Oracle Network

Build dedicated oracle network for StellarInsure:
- Specialized data providers
- Insurance-specific data feeds
- Lower latency and costs
- Tighter integration with protocol

### Machine Learning Integration

Use ML models for:
- Fraud detection
- Risk assessment
- Premium optimization
- Claim prediction

## Testing

### Oracle Simulation

For development and testing, use simulated oracle responses:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_weather_oracle() {
        let env = Env::default();
        let contract = StellarInsureClient::new(&env, &contract_id);
        
        // Simulate weather data
        let oracle_result = OracleResult {
            condition_met: true,
            value: -5, // Temperature -5°C
            timestamp: env.ledger().timestamp(),
            confidence: 95
        };
        
        // Verify condition triggers claim
        assert!(oracle_result.condition_met);
    }
}
```

### Integration Testing

Test oracle integration with real data sources in staging environment:

```bash
# Run oracle relay service in test mode
python -m backend.src.services.oracle_relay --test-mode

# Monitor oracle updates
curl http://localhost:8000/oracle/status
```

## Monitoring and Alerts

Set up monitoring for oracle health:

- Data freshness alerts
- Consensus failure notifications
- Provider downtime tracking
- Anomaly detection

**Example Alert Configuration:**
```yaml
alerts:
  - name: stale_oracle_data
    condition: data_age > 3600
    severity: warning
    
  - name: oracle_consensus_failure
    condition: consensus_providers < 2
    severity: critical
    
  - name: price_anomaly
    condition: price_deviation > 20%
    severity: high
```
