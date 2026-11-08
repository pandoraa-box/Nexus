# Nexus — USSD-to-Stellar/USDC Remittance (MVP)

Nexus lets African mobile users send USDC via USSD, backed by a Soroban smart contract on Stellar testnet. Operators monitor transactions and wallets through a branded web dashboard.

## Architecture

```
Africa's Talking USSD
         │
         ▼
┌─────────────────┐     ┌──────────────┐     ┌────────────────────┐
│  Backend        │────▶│  PostgreSQL   │     │  Soroban Contract │
│  (Express + TS) │     │  (users,      │     │  (NexusRegistry)  │
│  Port 4000      │     │   wallets,    │     │  Stellar Testnet  │
└─────────────────┘     │   txs)        │     └────────────────────┘
         │              └──────────────┘
         ▼
┌─────────────────┐
│  Frontend       │
│  (Next.js 16)   │
│  Port 3000      │
└─────────────────┘
```

### End-to-End Remittance Sequence Flow

*Alt-text description*: Sequence diagram illustrating the end-to-end remittance lifecycle: The mobile user dials a USSD shortcode (*347*123#) via Africa's Talking gateway; the gateway forwards the request to the Express backend via POST /api/ussd; the backend verifies user registration and wallet credentials in PostgreSQL; the backend resolves the recipient via Soroban RPC and invokes the NexusRegistry smart contract on Stellar testnet; upon transaction execution and on-chain event emission, the backend logs the record to PostgreSQL, terminates the USSD session with success, and Africa's Talking dispatches an SMS confirmation to the user.

```mermaid
sequenceDiagram
    autonumber
    actor User as Mobile User
    participant USSD as Africa's Talking (USSD Gateway)
    participant API as Backend (Express API)
    participant DB as PostgreSQL
    participant RPC as Soroban RPC
    participant Contract as NexusRegistry (Stellar)

    User->>USSD: Dial *347*123#
    USSD->>API: POST /api/ussd
    API->>DB: Lookup user + wallet
    DB-->>API: User & wallet record
    API->>RPC: resolve(phone)
    RPC->>Contract: resolve()
    Contract-->>RPC: Recipient Address
    API->>RPC: send(from, phone, amount)
    RPC->>Contract: send()
    Contract-->>RPC: Emit event
    API->>DB: INSERT transaction
    DB-->>API: OK
    API->>USSD: END Success
    USSD->>User: SMS with tx link
```

## Prerequisites

- Node.js 20+
- Rust 1.75+ with `wasm32-unknown-unknown` target
- PostgreSQL 16+
- Soroban CLI (install via `cargo install soroban-cli --features opt`)
- Africa's Talking sandbox account (free)

## 1. Soroban Contract — `contracts/nexus-registry`

### Build & Test

```bash
cd contracts/nexus-registry
cargo build --target wasm32-unknown-unknown --release
cargo test
```

### Deploy to Testnet

Set up your Stellar testnet identity:

```bash
soroban keys generate --network testnet nexus-admin
```

Build and deploy:

```bash
soroban contract build --package nexus-registry
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nexus_registry.wasm \
  --source nexus-admin \
  --network testnet
```

The deploy command prints the contract ID. Save it:

```bash
echo "NEXUS_CONTRACT_ID=<contract-id>" >> ../../backend/.env
```

Initialize the contract:

```bash
soroban contract invoke \
  --id <contract-id> \
  --source nexus-admin \
  --network testnet \
  -- \
  init \
  --admin $(soroban keys address nexus-admin)
```

### Contract Interface

| Method | Params | Description |
|--------|--------|-------------|
| `init` | `admin: Address` | Initialize contract with admin |
| `set_paused` | `paused: bool` | Pause/resume (admin only) |
| `register` | `phone: String, address: Address` | Register phone→address mapping |
| `resolve` | `phone: String` → `Address` | Look up address by phone |
| `send` | `from: Address, phone: String, amount: i128` | Send USDC, checks daily limit (1000 USDC) |
| `is_paused` | | Returns pause state |

## 2. Backend — `backend/`

### Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
```

### Database

```bash
sudo -u postgres psql -c "CREATE USER nexus WITH PASSWORD 'nexus';"
sudo -u postgres psql -c "CREATE DATABASE nexus OWNER nexus;"
npm run migrate
```

### Africa's Talking Sandbox

1. Sign up at https://sandbox.africastalking.com
2. Go to Your Apps → Create a new app (e.g. "NexusDev")
3. Copy the API Key to `AFRICASTALKING_API_KEY` in `.env`
4. Set `AFRICASTALKING_USERNAME=sandbox`
5. In the Africa's Talking Simulator, dial `*384*1234#` (or your shortcode)
6. Configure the callback URL to `https://your-ngrok-url/api/ussd`

For local testing, expose via ngrok:

```bash
ngrok http 4000
```

Then set the ngrok URL as your Africa's Talking USSD callback URL.

### Run

```bash
npm run dev
```

### Admin API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/login` | — | Get JWT token |
| GET | `/api/admin/transactions` | JWT | List recent transactions |
| GET | `/api/admin/wallets` | JWT | List all wallets |
| GET | `/api/admin/wallets?phone=234...` | JWT | Lookup wallet by phone |
| POST | `/api/admin/users` | JWT | Register a user |

### USSD Flow

```
Dial → "Welcome to Nexus"
  ├─ 1. Send Money → Enter phone → Enter amount → Confirm
  ├─ 2. Check Balance → Enter PIN
  └─ 3. My Wallet → Sent via SMS
```

## 3. Frontend — `frontend/`

### Setup

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
# Opens http://localhost:3000
```

### Build for production

```bash
npm run build
npm start
```

### Login

Default credentials are `admin` / `admin`. Change via `ADMIN_PASSWORD_HASH` in backend `.env`.

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` (blue) | `#0093D6` | Header, nav, buttons, links |
| `primary-light` | `#4FB4E3` | Button hover states |
| `pink` | `#EC1886` | CTAs, active nav, status highlights |
| `pink-light` | `#F05AA4` | Accent hover states |

## Environment Variables

Backend `.env`:

```
PORT=4000
DATABASE_URL=postgres://nexus:nexus@localhost:5432/nexus
JWT_SECRET=<random-64-char-string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-hash>
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXUS_CONTRACT_ID=<from-deploy-step>
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
HORIZON_URL=https://horizon-testnet.stellar.org
ENCRYPTION_KEY=<32-byte-hex>
AFRICASTALKING_API_KEY=<from-sandbox>
AFRICASTALKING_USERNAME=sandbox
```

Generate the encryption key:

```bash
openssl rand -hex 32
```

Generate a bcrypt password hash:

```bash
node -e "require('bcryptjs').hash('your-password', 10).then(console.log)"
```

## Project Structure

```
Nexus/
├── contracts/
│   └── nexus-registry/     # Soroban Rust contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs       # Contract implementation
│           └── test.rs      # Unit tests
├── backend/                 # Express + TypeScript
│   ├── src/
│   │   ├── index.ts         # Server entry
│   │   ├── config.ts        # Env config
│   │   ├── db.ts            # PostgreSQL client
│   │   ├── types.ts         # Shared types
│   │   ├── ussd.ts          # USSD FSM
│   │   ├── wallet.ts        # AES-256-GCM wallet
│   │   ├── soroban.ts       # Soroban RPC client
│   │   ├── auth.ts          # JWT + bcrypt
│   │   ├── routes/
│   │   │   ├── ussd.ts      # USSD webhook
│   │   │   └── admin.ts     # Admin API
│   │   └── middleware/
│   │       └── auth.ts      # JWT middleware
│   ├── migrations/
│   │   └── 001_init.sql      # Schema
│   └── .env.example
├── frontend/                # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── page.tsx     # Transactions dashboard
│   │   │   ├── actions.ts   # Server actions
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── wallets/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   └── header.tsx
│   │   └── lib/
│   │       └── proxy.ts     # API client
│   ├── tailwind.config.ts
│   └── next.config.ts
└── README.md
```

## License

MIT — built for Drips / Grantfox ecosystem.
