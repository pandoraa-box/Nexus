import { Router, Request, Response } from "express";
import { jwtAuth } from "../middleware/auth";
import { generateToken, verifyAdminPassword, hashPin, verifyPin } from "../auth";
import { query, queryOne } from "../db";
import { createWallet } from "../wallet";
import { Transaction, User, AuditLogEntry } from "../types";
import { config } from "../config";
import { loginLimiter, getClientIp } from "../middleware/rateLimit";

const router = Router();

// POST /api/admin/login
router.post("/admin/login", loginLimiter, async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const ip = getClientIp(req);
  if (username !== config.adminUsername) {
    await query(
      "INSERT INTO audit_log (admin_user, action, target, ip) VALUES ('unknown', 'login_failed', $1, $2)",
      [ip, ip]
    );
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await verifyAdminPassword(password);
  if (!valid) {
    await query(
      "INSERT INTO audit_log (admin_user, action, target, ip) VALUES ('unknown', 'login_failed', $1, $2)",
      [ip, ip]
    );
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken({ sub: username, role: "admin" });
  res.json({ token });
});

// GET /api/admin/transactions
router.get("/admin/transactions", jwtAuth, async (_req: Request, res: Response): Promise<void> => {
  const txs = await query<Transaction>(
    "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100"
  );
  res.json(txs);
});

// GET /api/admin/wallets
router.get("/admin/wallets", jwtAuth, async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.query;
  if (phone) {
    const user = await queryOne<User>(
      `SELECT u.id, u.phone, u.created_at, w.public_key 
       FROM users u JOIN wallets w ON w.id = u.wallet_id 
       WHERE u.phone = $1`,
      [phone]
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const txs = await query<Transaction>(
      `SELECT * FROM transactions WHERE from_phone = $1 OR to_phone = $1 ORDER BY created_at DESC LIMIT 50`,
      [phone]
    );
    res.json({ user, transactions: txs });
  } else {
    const users = await query<User & { public_key: string }>(
      `SELECT u.id, u.phone, u.created_at, w.public_key 
       FROM users u JOIN wallets w ON w.id = u.wallet_id 
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  }
});

// GET /api/admin/audit-log
router.get("/admin/audit-log", jwtAuth, async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(String(req.query.per_page || "50"), 10) || 50, 1), 100);
  const { admin_user } = req.query;
  const where = admin_user ? " WHERE admin_user = $1" : "";
  const params: any[] = admin_user ? [admin_user] : [];
  const offset = (page - 1) * perPage;

  const total = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM audit_log${where}`,
    params
  );
  const entries = await query<AuditLogEntry>(
    `SELECT id, admin_user, action, target, ip, user_agent, created_at
     FROM audit_log${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, perPage, offset]
  );

  res.json({ total: parseInt(total?.count ?? "0", 10), page, perPage, entries });
});

// POST /api/admin/users (register a user)
router.post("/admin/users", jwtAuth, async (req: Request, res: Response): Promise<void> => {
  const { phone, pin } = req.body;
  if (!phone || !pin) {
    res.status(400).json({ error: "Phone and pin required" });
    return;
  }
  if (!/^234\d{10}$/.test(phone)) {
    res.status(400).json({ error: "Invalid African phone number" });
    return;
  }
  if (pin.length < 4 || pin.length > 6) {
    res.status(400).json({ error: "PIN must be 4-6 digits" });
    return;
  }

  const existing = await queryOne("SELECT id FROM users WHERE phone = $1", [phone]);
  if (existing) {
    res.status(409).json({ error: "Phone already registered" });
    return;
  }

  const { wallet, publicKey } = await createWallet();
  const pinHash = await hashPin(pin);
  await query(
    "INSERT INTO users (phone, pin_hash, wallet_id) VALUES ($1, $2, $3)",
    [phone, pinHash, wallet.id]
  );

  res.status(201).json({ phone, publicKey, message: "User registered successfully" });
});

export default router;
