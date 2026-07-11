# Nexus Backend — Express + TypeScript

Handles USSD sessions, custodial wallet management, Soroban contract calls,
and the admin REST API.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- A deployed NexusRegistry contract on Stellar testnet (see `contracts/nexus-registry/README.md`)

## Setup

```bash
cp .env.example .env
# Edit .env with your values
npm install
```

## Database

```bash
# Create the database user and database
sudo -u postgres psql -c "CREATE USER nexus WITH PASSWORD 'nexus';"
sudo -u postgres psql -c "CREATE DATABASE nexus OWNER nexus;"

# Run migrations
npm run migrate
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | | `4000` | Server port |
| `DATABASE_URL` | ✓ | `postgres://nexus:nexus@localhost:5432/nexus` | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | *(dev fallback)* | Secret for signing admin JWT tokens |
| `ADMIN_USERNAME` | | `admin` | Admin login username |
| `ADMIN_PASSWORD_HASH` | | *(empty = plain text)* | bcrypt hash of admin password |
| `SOROBAN_RPC_URL` | | `https://soroban-testnet.stellar.org` | Soroban RPC endpoint |
| `NEXUS_CONTRACT_ID` | ✓ | — | Deployed NexusRegistry contract ID |
| `STELLAR_NETWORK_PASSPHRASE` | | `Test SDF Network ; September 2015` | Stellar network passphrase |
| `HORIZON_URL` | | `https://horizon-testnet.stellar.org` | Horizon endpoint for account info |
| `ENCRYPTION_KEY` | ✓ | — | 32-byte hex string for AES-256-GCM wallet encryption |
| `AFRICASTALKING_API_KEY` | | — | Africa's Talking API key |
| `AFRICASTALKING_USERNAME` | | `sandbox` | Africa's Talking username |
| `AFRICASTALKING_SANDBOX` | | `true` | Use Africa's Talking sandbox |

Generate an encryption key:

```bash
openssl rand -hex 32
```

Generate a bcrypt password hash:

```bash
node -e "require('bcryptjs').hash('your-password', 10).then(console.log)"
```

## Run

```bash
npm run dev        # development with hot reload
npm run build      # TypeScript compilation
npm start          # production start
```

## API Endpoints

### USSD (Africa's Talking)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ussd` | USSD callback webhook |

### Admin (JWT-gated)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/login` | Authenticate and receive JWT |
| `GET` | `/api/admin/transactions` | List recent transactions |
| `GET` | `/api/admin/wallets` | List all wallets |
| `GET` | `/api/admin/wallets?phone=234...` | Look up wallet by phone |
| `POST` | `/api/admin/users` | Register a new user |

## USSD Flow

```
Dial *347*123#
  ↓
Welcome to Nexus
  1. Send Money  →  Enter phone  →  Enter amount  →  Confirm  →  Done
  2. Check Balance
  3. My Wallet
```

## Africa's Talking Sandbox

1. Sign up at https://sandbox.africastalking.com
2. Create an app, copy the API key to `AFRICASTALKING_API_KEY`
3. Set the USSD callback URL to `https://<your-ngrok-url>/api/ussd`
4. Dial `*384*1234#` (or your shortcode) in the Africa's Talking simulator

For local testing, expose your server with ngrok:

```bash
ngrok http 4000
```

## Project Structure

```
backend/
├── migrations/
│   └── 001_init.sql         # Database schema
├── src/
│   ├── index.ts             # Server entry point
│   ├── config.ts            # Environment configuration
│   ├── db.ts                # PostgreSQL client + migrations runner
│   ├── types.ts             # Shared TypeScript types
│   ├── ussd.ts              # USSD session state machine
│   ├── wallet.ts            # AES-256-GCM wallet encryption/decryption
│   ├── soroban.ts           # Soroban RPC contract client
│   ├── auth.ts              # bcrypt PIN hashing + JWT
│   ├── routes/
│   │   ├── ussd.ts          # USSD webhook handler
│   │   └── admin.ts         # Admin REST API
│   └── middleware/
│       └── auth.ts          # JWT authentication middleware
├── .env.example
├── package.json
└── tsconfig.json
```
