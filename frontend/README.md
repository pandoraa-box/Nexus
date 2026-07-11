# Nexus Frontend — Next.js 16

Operations dashboard for the Nexus USSD-to-Stellar remittance platform.
Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and the Satoshi
typeface.

## Prerequisites

- Node.js 20+
- The Nexus backend running on port 4000 (or configured via `NEXT_PUBLIC_API_URL`)

## Setup

```bash
cp .env.example .env.local
npm install
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Backend API base URL |

## Development

```bash
npm run dev
```

Opens at `http://localhost:3000`. Uses Turbopack for fast refresh.

## Build

```bash
npm run build
npm start
```

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Public landing page |
| `/login` | No | Admin sign-in |
| `/dashboard` | Yes | Transaction history, stats, stellar.expert links |
| `/wallets` | Yes | Phone lookup, wallet public keys |

## Brand Colors

The design system uses two accent colours:

- **Primary blue** (`#0093D6`) — header, navigation, buttons, links
- **Pink** (`#EC1886`) — section labels, active nav state, decorative accents

These are defined in `tailwind.config.ts` as `primary` and `pink` theme
colours, and in `globals.css` as CSS custom properties.

## Font

The site uses the Satoshi typeface from Fontshare. It is loaded via
`@import` in `globals.css` and set as the `font-family` on `body`.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 3.4
- Satoshi (Fontshare)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Satoshi font
│   │   ├── globals.css         # Tailwind + Satoshi @import
│   │   ├── page.tsx            # Public landing page
│   │   ├── actions.ts          # Server actions
│   │   ├── login/
│   │   │   └── page.tsx        # Admin sign-in
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Transactions dashboard (auth-gated)
│   │   └── wallets/
│   │       └── page.tsx        # Wallet lookup (auth-gated)
│   ├── components/
│   │   └── header.tsx          # Navigation header
│   └── lib/
│       └── proxy.ts            # API client with JWT token management
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```
