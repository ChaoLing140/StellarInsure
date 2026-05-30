# Smart Contract Documentation

## StellarInsure contract

State-changing operations emit Soroban events for indexers and off-chain consumers.

### Events

#### `("policy", "created")`
- `policy_id`
- `policyholder`
- `policy_type`
- `coverage_amount`
- `premium`
- `start_time`
- `end_time`
- `trigger_condition`

#### `("policy", "premium")`
- `policy_id`
- `policyholder`
- `amount`

#### `("claim", "submit")`
- `policy_id`
- `policyholder`
- `claim_amount`
- `proof`
- `timestamp`

#### `("claim", "process")`
- `policy_id`
- `policyholder`
- `claim_amount`
- `approved`
- `status`

#### `("policy", "cancel")`
- `policy_id`
- `policyholder`

## RiskPool contract

The risk pool contract manages liquidity-provider balances and yield distribution.

### Core functions
- `add_liquidity(provider, amount)`
- `withdraw_liquidity(provider, amount)`
- `distribute_yield(amount)`
- `claim_yield(provider)`
- `get_provider_position(provider)`
- `get_pool_balance()`
- `get_pool_stats()`

### Pool events
- `("pool", "deposit")`
- `("pool", "withdraw")`
- `("pool", "yield")`
- `("pool", "claim")`

## Initialization Runbook

This runbook describes the ordered steps to deploy and initialize the StellarInsure smart contracts on a Soroban-compatible testnet (e.g. Futurenet / Testnet).

### Prerequisites

| Item | Requirement |
|---|---|
| Soroban CLI | `soroban` version 21+ installed and configured |
| Network | Testnet RPC URL (e.g. `https://rpc-futurenet.stellar.org`) |
| Network passphrase | `Test SDF Network ; September 2015` (Testnet) |
| Admin keypair | A funded Stellar account with enough XLM for deploy + initialization |
| Premium token | A Stellar asset contract (Classic asset or SAC) to use for premiums/payouts |
| Optional: oracle addresses | Pre-deployed oracle contracts if using automatic claim triggers |

### Step-by-step

#### 1. Deploy main contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarinsure.wasm \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE>
```

Save the returned contract ID as `CONTRACT_ID`.

#### 2. Deploy RiskPool contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/risk_pool.wasm \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE>
```

Save the returned contract ID as `RISK_POOL_ID`.

#### 3. Initialize main contract

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE> \
  -- \
  init \
  --admin <ADMIN_PUBLIC>
```

#### 4. Set premium token

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE> \
  -- \
  set_premium_token \
  --admin <ADMIN_PUBLIC> \
  --token <PREMIUM_TOKEN_ADDRESS>
```

#### 5. Initialize RiskPool

```bash
soroban contract invoke \
  --id <RISK_POOL_ID> \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE> \
  -- \
  init \
  --admin <ADMIN_PUBLIC>
```

#### 6. Link RiskPool to main contract

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE> \
  -- \
  set_risk_pool \
  --admin <ADMIN_PUBLIC> \
  --risk_pool <RISK_POOL_ID>
```

#### 7. (Optional) Register oracle

Repeat for each oracle type needed:

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> \
  --network-passphrase <PASSPHRASE> \
  -- \
  register_oracle \
  --admin <ADMIN_PUBLIC> \
  --oracle_type <ORACLE_TYPE_SYMBOL> \
  --oracle_address <ORACLE_CONTRACT_ID>
```

#### 8. Verify deployment

```bash
# Check contract version
soroban contract invoke --id <CONTRACT_ID> --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> --network-passphrase <PASSPHRASE> \
  -- version

# Check contract is not paused
soroban contract invoke --id <CONTRACT_ID> --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> --network-passphrase <PASSPHRASE> \
  -- get_paused

# Check risk pool config
soroban contract invoke --id <RISK_POOL_ID> --source <ADMIN_SECRET> \
  --rpc-url <RPC_URL> --network-passphrase <PASSPHRASE> \
  -- get_reserve_ratio
```

### Rollback / retry notes

| Failure point | Action |
|---|---|
| Contract deploy fails (insufficient balance) | Fund the admin account with more XLM and retry the deploy. |
| `init` returns `AlreadyInitialized` | The contract was already initialized — skip to step 4. This is safe. |
| `set_premium_token` fails with `Unauthorized` | Verify the admin address and secret match the account used in `init`. |
| RiskPool not linked | Invoking `pay_premium` will work but premiums will not flow to the pool. Run step 6 to link. |
| Oracle registration fails | The contract can operate without oracles; manual claim processing still works. Retry after fixing the oracle address. |
| Any step fails mid-way | Steps are **not** transactional — you can safely retry any step individually. No partial state is left behind that blocks re-execution. |
| Wrong network | Ensure `--rpc-url` and `--network-passphrase` match. Deploy on the wrong network means starting over with the correct RPC. |

### Network assumptions

- The admin keypair must be **funded** with sufficient XLM to cover deploy fees and contract storage rent.
- The premium token **must** be a pre-deployed Stellar Asset Contract (SAC). Classic assets are not directly supported.
- The risk pool contract **should** be initialized before it receives token transfers from the main contract. If it receives tokens before `init`, they may be unrecoverable.
- Oracle contracts must conform to the `OracleProvider` trait defined in `oracle.rs`. Stub oracles (`WeatherOracle`, `FlightOracle`, etc.) are built into the contract for development use and do not require external registration.
