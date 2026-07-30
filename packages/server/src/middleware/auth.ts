import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function signUserToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "180d" });
}

export function verifyUserToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return payload.sub;
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  const userId = token ? verifyUserToken(token) : null;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  req.userId = userId;
  next();
}
