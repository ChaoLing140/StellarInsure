# Troubleshooting Guide: Wallet and Network Mismatches

> **Relates to:** Backlog #325 · Issue #451
>
> This guide helps contributors and users resolve the most common network, RPC, and wallet configuration mismatches encountered during local setup and development.

---

## Table of Contents

1. [Quick Reference: Network Settings](#quick-reference-network-settings)
2. [Common Symptoms and Fixes](#common-symptoms-and-fixes)
   - [Wrong network passphrase](#1-wrong-network-passphrase)
   - [Freighter wallet on the wrong network](#2-freighter-wallet-on-the-wrong-network)
   - [Horizon URL mismatch](#3-horizon-url-mismatch)
   - [Soroban RPC URL mismatch](#4-soroban-rpc-url-mismatch)
   - [Contract ID not found on the active network](#5-contract-id-not-found-on-the-active-network)
   - [Transaction rejected: invalid sequence number](#6-transaction-rejected-invalid-sequence-number)
   - [CORS errors from the frontend](#7-cors-errors-from-the-frontend)
   - [Backend cannot reach Horizon or Soroban RPC](#8-backend-cannot-reach-horizon-or-soroban-rpc)
3. [Environment Variable Reference](#environment-variable-reference)
4. [Checking Your Current Configuration](#checking-your-current-configuration)
5. [Verification Checklist](#verification-checklist)

---

## Quick Reference: Network Settings

| Setting | Testnet | Mainnet |
|---|---|---|
| **Network passphrase** | `Test SDF Network ; September 2015` | `Public Global Stellar Network ; September 2015` |
| **Horizon URL** | `https://horizon-testnet.stellar.org` | `https://horizon.stellar.org` |
| **Soroban RPC URL** | `https://soroban-testnet.stellar.org` | `https://soroban.stellar.org` (or a private node) |
| **Friendbot (funded accounts)** | `https://friendbot.stellar.org` | ❌ Not available |
| **Stellar Laboratory** | `https://laboratory.stellar.org` (select Testnet) | `https://laboratory.stellar.org` (select Mainnet) |

> ⚠️ **StellarInsure is currently pre-mainnet.** The project default is **testnet**. Do not point any environment variable at mainnet endpoints unless you are intentionally running a production deployment.

---

## Common Symptoms and Fixes

### 1. Wrong network passphrase

**Symptoms**
- `Transaction rejected: bad sequence` or `invalid signature` from Horizon.
- Soroban CLI returns `error: invalid passphrase`.
- Submitted transactions succeed locally but never appear on the explorer.

**Cause**
The `STELLAR_NETWORK_PASSPHRASE` env var (or the passphrase passed to Soroban CLI) does not match the network the Horizon/RPC endpoint belongs to.

**Fix**

In `.env.docker` (or your local `.env`), confirm:

```dotenv
# Testnet (default for StellarInsure development)
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

When invoking the Soroban CLI directly, always pass `--network testnet` (or the matching `--network-passphrase` flag) so the CLI uses the same passphrase as the backend:

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- get_policy --policy-id 1
```

---

### 2. Freighter wallet on the wrong network

**Symptoms**
- The frontend connects to Freighter but the wallet address shown is different from what you see on testnet.stellar.expert.
- Policy creation transactions appear to succeed in the UI but are never recorded on-chain.
- `User declined to sign` even though you clicked **Approve** — this can happen when Freighter refuses a transaction built for a different network.

**Cause**
Freighter defaults to **Mainnet**. Most StellarInsure development targets **Testnet**.

**Fix**

1. Click the Freighter extension icon.
2. Open **Settings → Network**.
3. Select **Testnet**.
4. Reload the StellarInsure frontend (`http://localhost:3000`).

Freighter stores the active network per-browser-profile, so a fresh browser profile will revert to mainnet.

---

### 3. Horizon URL mismatch

**Symptoms**
- API calls to `/api/policies` or `/api/transactions` return HTTP 400/500.
- Backend logs show `horizon: not found` or `OperationNotSupportedError`.
- A testnet account's balance is shown as 0 even after running Friendbot.

**Cause**
`STELLAR_HORIZON_URL` points at mainnet (`https://horizon.stellar.org`) while the contract and keys are on testnet, or vice-versa.

**Fix**

Check your active env file:

```bash
grep STELLAR_HORIZON_URL .env.docker
# should print:
# STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

If you have a local `.env` that overrides `.env.docker`, confirm that file too. The backend reads `STELLAR_HORIZON_URL` on startup; restart the backend container after any change:

```bash
docker-compose down && docker-compose up --build
```

---

### 4. Soroban RPC URL mismatch

**Symptoms**
- `soroban contract deploy` fails with `invalid response from RPC`.
- `soroban contract invoke` returns `contract not found`.
- Frontend shows `SimulateTransactionError` in the browser console.

**Cause**
The Soroban RPC endpoint used by the CLI or the frontend SDK is not on the same network as the deployed contract.

**Fix — Soroban CLI**

Use named network aliases so the CLI resolves both the RPC URL and passphrase automatically:

```bash
# Add the testnet profile once
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Then deploy/invoke with --network testnet
soroban contract deploy --network testnet \
  --wasm target/wasm32-unknown-unknown/release/stellarinsure.wasm
```

**Fix — Frontend SDK**

In `frontend/.env.local` (or the equivalent config), add:

```dotenv
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

Restart the Next.js dev server after changes (`npm run dev`).

---

### 5. Contract ID not found on the active network

**Symptoms**
- `soroban contract invoke` returns `Contract not found`.
- Backend logs show `ContractNotFound` when loading policy data.
- The frontend displays a blank policy list with no errors.

**Cause**
`STELLAR_CONTRACT_ID` contains an ID that was deployed on a different network, or the contract has not been deployed yet.

**Fix**

Deploy the contract to the correct network and capture the returned ID:

```bash
CONTRACT_ID=$(soroban contract deploy \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/stellarinsure.wasm)
echo "Deployed: $CONTRACT_ID"
```

Then update your env file:

```dotenv
STELLAR_CONTRACT_ID=<the ID printed above>
```

Restart all services. Contract IDs are network-scoped — a testnet ID will never resolve on mainnet.

---

### 6. Transaction rejected: invalid sequence number

**Symptoms**
- Soroban CLI or Freighter returns `txBAD_SEQ`.
- Rapid successive transactions from the same account all fail after the first.

**Cause**
The Stellar account's sequence number tracked by the client is out of sync with Horizon, typically because a previous transaction failed mid-flight or multiple processes are submitting from the same key.

**Fix**

Fetch the current sequence number and re-sign:

```bash
curl https://horizon-testnet.stellar.org/accounts/<YOUR_PUBLIC_KEY> \
  | python3 -m json.tool | grep sequence
```

If using the Soroban CLI, it refreshes the sequence automatically on the next invocation. If the issue persists, ensure only one process is signing with `STELLAR_ADMIN_SECRET` at a time (the Docker backend and a local CLI session, for example, will conflict).

---

### 7. CORS errors from the frontend

**Symptoms**
- Browser console shows `Access-Control-Allow-Origin` errors when the frontend calls `http://localhost:8000`.
- API requests work via `curl` but fail in the browser.

**Cause**
`CORS_ORIGINS` in the backend env does not include the origin the browser is using.

**Fix**

In `.env.docker`:

```dotenv
CORS_ORIGINS=http://localhost:3000,http://localhost
```

If you access the frontend from a non-standard port or hostname (e.g., a Codespace URL), add it here as a comma-separated entry. Restart the backend after changes.

---

### 8. Backend cannot reach Horizon or Soroban RPC

**Symptoms**
- Backend startup logs show `Connection refused` or `TimeoutError` against a Stellar endpoint.
- Health check endpoint (`http://localhost:8000/health`) returns degraded status.

**Cause — Docker networking**
Inside Docker containers the host `localhost` refers to the container itself, not your machine. If you accidentally set `STELLAR_HORIZON_URL=http://localhost:8000` (pointing back at the backend itself) you will get a loop.

**Fix**
Always use the public SDF endpoints or a resolvable hostname inside Docker:

```dotenv
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

If you run a local Stellar Quickstart node, use the Docker service name instead of `localhost`:

```dotenv
STELLAR_HORIZON_URL=http://stellar:8000
```

and make sure the Quickstart container is in the same Docker Compose network.

---

## Environment Variable Reference

The following variables control network and wallet behaviour. All examples below use testnet defaults matching `.env.docker`.

| Variable | File(s) | Testnet value | Notes |
|---|---|---|---|
| `STELLAR_NETWORK_PASSPHRASE` | `.env.docker`, backend `.env` | `Test SDF Network ; September 2015` | Must match Horizon and Soroban RPC exactly, including spaces and punctuation. |
| `STELLAR_HORIZON_URL` | `.env.docker`, backend `.env` | `https://horizon-testnet.stellar.org` | Used by the backend to fetch account info and submit transactions. |
| `STELLAR_CONTRACT_ID` | `.env.docker`, backend `.env` | *(output of `soroban contract deploy`)* | Network-scoped. Re-deploy if switching networks. |
| `STELLAR_ADMIN_SECRET` | `.env.docker`, backend `.env` | *(your testnet key pair)* | Never commit a real secret key. Use Friendbot to fund testnet accounts. |
| `STELLAR_ADMIN_PUBLIC` | `.env.docker`, backend `.env` | *(matching public key)* | Used for read-only lookups and signing verification. |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | `frontend/.env.local` | `https://soroban-testnet.stellar.org` | Read by the Next.js frontend at build time. |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | `frontend/.env.local` | `Test SDF Network ; September 2015` | Must match the backend passphrase. |
| `CORS_ORIGINS` | `.env.docker` | `http://localhost:3000,http://localhost` | Extend when accessing from non-standard origins. |

> **Files to check:** `.env.docker` (Docker Compose), `backend/.env` (local backend), `frontend/.env.local` (local frontend). When any value changes, restart the affected service.

---

## Checking Your Current Configuration

Use these one-liners to quickly verify what each service is using.

**Confirm backend env inside Docker:**
```bash
docker-compose exec backend env | grep STELLAR
```

**Verify Horizon is reachable and on the expected network:**
```bash
curl -s https://horizon-testnet.stellar.org/ | python3 -m json.tool | grep network_passphrase
# Expected: "Test SDF Network ; September 2015"
```

**Verify Soroban RPC health:**
```bash
curl -s -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' | python3 -m json.tool
# Expected: {"result":{"status":"healthy"}, ...}
```

**Check Freighter's active network (browser console):**
```javascript
const { network } = await window.freighter.getNetworkDetails();
console.log(network); // should be "TESTNET"
```

**Check that a contract exists on testnet:**
```bash
soroban contract fetch --network testnet --id <CONTRACT_ID>
# Any output means the contract is present; an error means it is not deployed.
```

---

## Verification Checklist

Run through this list whenever setup fails or after switching between testnet and mainnet.

- [ ] `STELLAR_NETWORK_PASSPHRASE` matches the Horizon and Soroban RPC endpoint in use.
- [ ] `STELLAR_HORIZON_URL` points at the intended network (testnet for development).
- [ ] `NEXT_PUBLIC_SOROBAN_RPC_URL` (frontend) is set to the testnet RPC.
- [ ] `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` (frontend) matches the backend passphrase exactly.
- [ ] `STELLAR_CONTRACT_ID` was deployed on the same network as the Horizon URL.
- [ ] Freighter wallet is set to **Testnet** (Settings → Network).
- [ ] `CORS_ORIGINS` includes the URL you're opening in the browser.
- [ ] No two processes are signing with the same `STELLAR_ADMIN_SECRET` concurrently.
- [ ] After any env change, the relevant Docker service has been restarted.

---

*For further setup guidance, see [CONTRIBUTING.md](../CONTRIBUTING.md) and [docs/ARCHITECTURE.md](./ARCHITECTURE.md). Report issues not covered here in [GitHub Issues](https://github.com/ChaoLing140/StellarInsure/issues).*
