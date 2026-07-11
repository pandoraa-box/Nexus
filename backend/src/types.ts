export interface Wallet {
  id: string;
  public_key: string;
  encrypted_secret: Buffer;
  created_at: Date;
}

export interface User {
  id: string;
  phone: string;
  pin_hash: string;
  wallet_id: string;
  created_at: Date;
}

export interface Transaction {
  id: string;
  from_phone: string;
  to_phone: string;
  amount_stroops: number;
  tx_hash: string | null;
  status: string;
  error_message: string | null;
  created_at: Date;
}

export type UssdState =
  | "menu"
  | "send_recipient"
  | "send_amount"
  | "send_confirm"
  | "balance"
  | "wallet_info";

export interface UssdSession {
  phone: string;
  state: UssdState;
  data: Record<string, string>;
}
