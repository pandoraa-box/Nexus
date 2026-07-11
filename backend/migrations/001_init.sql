CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_key TEXT NOT NULL UNIQUE,
  encrypted_secret BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  amount_stroops BIGINT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
