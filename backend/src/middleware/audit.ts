import { Request } from "express";
import { query } from "../db";

const SENSITIVE_FIELD = /password|pin|secret|token|authorization/i;

function redactValue(value: unknown): string {
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = SENSITIVE_FIELD.test(key) ? "[REDACTED]" : val;
    }
    return JSON.stringify(sanitized);
  }
  return String(value ?? "");
}

export function sanitizeTarget(req: Request): string | null {
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (typeof body.phone === "string" && body.phone) {
    return body.phone;
  }
  const query = req.query as Record<string, unknown>;
  if (query && Object.keys(query).length > 0) {
    return redactValue(query);
  }
  return null;
}

export function logAdminAction(req: Request, adminUser: string, action: string): void {
  query(
    "INSERT INTO audit_log (admin_user, action, target, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
    [adminUser, action, sanitizeTarget(req), req.ip ?? null, req.headers["user-agent"] ?? null]
  ).catch(() => {});
}
