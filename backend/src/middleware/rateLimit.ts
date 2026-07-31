import { rateLimit } from "express-rate-limit";
import { Request } from "express";
import { config } from "../config";

export function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export const loginLimiter = rateLimit({
  windowMs: config.loginRateLimitWindowMs,
  limit: config.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});
