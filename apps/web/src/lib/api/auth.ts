import { apiFetch } from "./client";
import type { AuthUser } from "./types";

export interface AuthResponse {
  user: AuthUser;
}

export const authApi = {
  register: (input: { email: string; name: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input }),

  login: (input: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input }),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),

  me: (signal?: AbortSignal) =>
    apiFetch<AuthUser>("/auth/me", { signal, timeoutMs: 10_000 }),
};
