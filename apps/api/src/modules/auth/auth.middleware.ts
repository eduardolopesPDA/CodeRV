import { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "./cookies";
import { verifyToken } from "./jwt";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "UNAUTHORIZED" });
  }
}
