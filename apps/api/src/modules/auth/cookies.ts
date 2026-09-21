import { Response } from "express";

export const AUTH_COOKIE_NAME = "token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEVEN_DAYS_MS,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}
