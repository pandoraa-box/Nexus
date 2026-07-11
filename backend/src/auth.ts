import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config";

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function generateToken(payload: { sub: string; role: string }): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "24h" });
}

export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    return jwt.verify(token, config.jwtSecret) as { sub: string; role: string };
  } catch {
    return null;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!config.adminPasswordHash) {
    return password === "admin" && config.adminUsername === "admin";
  }
  return bcrypt.compare(password, config.adminPasswordHash);
}
