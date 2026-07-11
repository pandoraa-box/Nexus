# Nexus Registry — Soroban Smart Contract

Manages phone-to-Stellar-address mappings, daily send limits, and on-chain
send events for the Nexus platform.

## Prerequisites

- Rust 1.75+ with `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`)
- Soroban CLI (`cargo install soroban-cli --features opt`)
- Stellar testnet identity (`soroban keys generate --network testnet nexus-admin`)

## Build

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Test

Tests require the `testutils` feature:

```bash
cargo test --features testutils
```

Note: may not compile on Rust 1.96+ due to `ed25519-dalek`/`ChaCha20Rng`
trait compatibility. If tests fail, build the library only (`cargo build --lib`)
and test via the backend integration tests instead.

## Deploy

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nexus_registry.wasm \
  --source nexus-admin \
  --network testnet
```

Save the returned contract ID as `NEXUS_CONTRACT_ID` in `backend/.env`.

## Initialize

```bash
soroban contract invoke \
  --id <contract-id> \
  --source nexus-admin \
  --network testnet \
  -- \
  init \
  --admin $(soroban keys address nexus-admin)
```

## Contract Methods

| Method | Params | Description |
|--------|--------|-------------|
| `init` | `admin: Address` | Initialise the contract with an admin address |
| `set_paused` | `paused: bool` | Pause or resume (admin only) |
| `register` | `phone: String, address: Address` | Map a phone number to a Stellar address |
| `resolve` | `phone: String` → `Address` | Look up the address for a phone number |
| `send` | `from: Address, phone: String, amount: i128` | Send USDC, enforce daily limit (1,000 USDC) |
| `is_paused` | — → `bool` | Check whether the contract is paused |

## Errors

| Error | Code | Meaning |
|-------|------|---------|
| `NotRegistered` | 1 | Phone number not found |
| `AlreadyRegistered` | 2 | Phone already registered |
| `Paused` | 3 | Contract is paused |
| `DailyLimitExceeded` | 4 | Exceeded 1,000 USDC daily limit |
| `InvalidAmount` | 5 | Amount is zero or negative |

## Events

The `send` method emits:

```
sent(from: Address, phone: String, amount: i128, day: u64)
```

## Environment

No `.env` file needed for the contract itself — configuration is handled by
the Soroban CLI and `soroban keys`.
