import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET env var is required");
  }
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: "7d", algorithm: "HS256" });
}

export function verifyToken(token: string): { sub: string } {
  return jwt.verify(token, getSecret(), { algorithms: ["HS256"] }) as { sub: string };
}
