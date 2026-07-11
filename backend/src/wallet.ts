import * as crypto from "crypto";
import { Keypair } from "@stellar/stellar-sdk";
import { config } from "./config";
import { queryOne, query } from "./db";
import { Wallet } from "./types";

const ALGO = "aes-256-gcm";
const IV_LEN = 16;
const TAG_LEN = 16;

function getKey(): Buffer {
  const key = config.encryptionKey;
  if (!key) throw new Error("ENCRYPTION_KEY not set");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes hex");
  return buf;
}

function encrypt(plaintext: string): Buffer {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(data: Buffer): string {
  const key = getKey();
  const iv = data.subarray(0, IV_LEN);
  const tag = data.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const encrypted = data.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf-8");
}

export async function createWallet(): Promise<{ wallet: Wallet; publicKey: string }> {
  const kp = Keypair.random();
  const encrypted = encrypt(kp.secret());
  const wallet = await queryOne<Wallet>(
    `INSERT INTO wallets (public_key, encrypted_secret) VALUES ($1, $2) RETURNING *`,
    [kp.publicKey(), encrypted]
  );
  if (!wallet) throw new Error("Failed to create wallet");
  return { wallet, publicKey: kp.publicKey() };
}

export function getSecretKey(encryptedSecret: Buffer): string {
  return decrypt(encryptedSecret);
}

export async function getWalletByPublicKey(publicKey: string): Promise<Wallet | null> {
  return queryOne<Wallet>("SELECT * FROM wallets WHERE public_key = $1", [publicKey]);
}

export async function getWalletById(id: string): Promise<Wallet | null> {
  return queryOne<Wallet>("SELECT * FROM wallets WHERE id = $1", [id]);
}

export { decrypt, encrypt, getKey };
