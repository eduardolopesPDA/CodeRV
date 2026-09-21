import { ApiError, apiFetch } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
}

interface ZodFlattenedError {
  fieldErrors?: Record<string, string[]>;
}

const FIELD_MESSAGES: Record<string, string> = {
  email: "E-mail inválido. Verifique se digitou o endereço corretamente.",
  name: "Informe seu nome.",
  password: "A senha precisa ter pelo menos 8 caracteres.",
};

export function getAuthErrorMessage(err: unknown, context: "login" | "register"): string {
  if (!(err instanceof ApiError)) {
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
  }

  const body = err.body as { error?: string | ZodFlattenedError } | null;

  if (err.status === 400 && body?.error && typeof body.error === "object") {
    const fieldErrors = body.error.fieldErrors ?? {};
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField && FIELD_MESSAGES[firstField]) {
      return FIELD_MESSAGES[firstField];
    }
    return "Verifique os dados informados e tente novamente.";
  }

  const code = typeof body?.error === "string" ? body.error : undefined;
  if (code === "EMAIL_IN_USE") {
    return "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.";
  }
  if (code === "INVALID_CREDENTIALS") {
    return "E-mail ou senha incorretos.";
  }

  if (err.status >= 500) {
    return "O servidor encontrou um problema. Tente novamente em instantes.";
  }

  return context === "register"
    ? "Não foi possível criar a conta. Tente novamente."
    : "Não foi possível entrar. Tente novamente.";
}

export function register(email: string, name: string, password: string) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function me() {
  return apiFetch<AuthResponse>("/auth/me");
}
