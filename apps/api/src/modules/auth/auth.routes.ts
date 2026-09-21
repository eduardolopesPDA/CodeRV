import { Router } from "express";
import { z } from "zod";
import {
  EmailInUseError,
  getUserById,
  registerUser,
  validateCredentials,
} from "./auth.service";
import { AuthenticatedRequest, requireAuth } from "./auth.middleware";
import { clearAuthCookie, setAuthCookie } from "./cookies";
import { signToken } from "./jwt";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, name, password } = parsed.data;

  try {
    const user = await registerUser(email, name, password);
    setAuthCookie(res, signToken(user.id));
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    if (err instanceof EmailInUseError) {
      return res.status(409).json({ error: "EMAIL_IN_USE" });
    }
    throw err;
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await validateCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  setAuthCookie(res, signToken(user.id));
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await getUserById(req.userId!);
  if (!user) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});
