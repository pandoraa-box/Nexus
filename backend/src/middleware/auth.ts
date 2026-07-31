import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth";
import { logAdminAction } from "./audit";

export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as any).user = payload;
  next();
  logAdminAction(req, payload.sub, `${req.method} ${req.path}`);
}
