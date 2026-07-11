# Contributing to Nexus

Thanks for your interest in contributing. Nexus is an MVP built for the
Drips / Grantfox ecosystem, and we welcome bug reports, feature suggestions,
and pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Labels](#issue-labels)
- [Commit Conventions](#commit-conventions)

## Code of Conduct

This project follows a simple principle: be respectful and constructive.
Harassment, trolling, and personal attacks are not tolerated.

## How to Contribute

1. **Report a bug** — open an issue using the `bug` label. Include steps to
   reproduce, expected behaviour, and actual behaviour.
2. **Suggest a feature** — open an issue using the `enhancement` label.
   Describe the use case and why it matters.
3. **Submit a pull request** — fork the repo, create a feature branch, and
   open a PR. Keep changes focused on a single concern.

## Development Setup

### Prerequisites

- Rust 1.75+ (`rustup target add wasm32-unknown-unknown`)
- Node.js 20+
- PostgreSQL 16+
- Soroban CLI (`cargo install soroban-cli --features opt`)
- Africa's Talking sandbox account (free)

### One-time

```bash
# Contract
cd contracts/nexus-registry
cargo build --target wasm32-unknown-unknown --release

# Backend
cd backend
cp .env.example .env
npm install
npm run migrate

# Frontend
cd frontend
cp .env.example .env.local
npm install
```

### Run locally

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

## Pull Request Guidelines

- Use a branch named `feat/short-description` or `fix/short-description`.
- Keep the PR small — one feature or fix per PR.
- Include a clear description of what the PR changes and why.
- Verify the project builds before opening:
  ```bash
  cd contracts/nexus-registry && cargo build --lib
  cd backend && npx tsc --noEmit
  cd frontend && npm run build
  ```
- Do not commit secrets, `.env` files, or `node_modules`.

## Issue Labels

| Label | Meaning |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature or improvement |
| `documentation` | Docs or README changes |
| `good first issue` | Beginner-friendly task |
| `frontend` | Next.js / React / Tailwind |
| `backend` | Express / PostgreSQL / API |
| `contract` | Soroban / Rust / Stellar |
| `ops` | CI/CD / deployment / config |
| `security` | Encryption / auth / key mgmt |

## Commit Conventions

We use conventional commits:

```
feat: add multi-language USSD support
fix: resolve daily limit timezone bug
docs: update README with env vars table
chore: bump stellar-sdk to v12
```

Prefixes: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.
