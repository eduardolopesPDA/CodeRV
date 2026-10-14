const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const DEFAULT_TIMEOUT_MS = 20_000;

export const UNAUTHORIZED_EVENT = "coderv:unauthorized";

export type ApiErrorPayload =
  | { error: string }
  | { error: { formErrors?: string[]; fieldErrors?: Record<string, string[]> } }
  | null;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fieldErrors: Record<string, string[]>;
  readonly payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;

    if (payload && typeof payload.error === "string") {
      this.code = payload.error;
      this.fieldErrors = {};
    } else if (payload && typeof payload.error === "object") {
      this.code = null;
      this.fieldErrors = payload.error.fieldErrors ?? {};
    } else {
      this.code = null;
      this.fieldErrors = {};
    }
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = (await response.json().catch(() => null)) as T | null;

    if (!response.ok) {
      const error = new ApiError(
        response.status,
        payload as ApiErrorPayload,
      );
      if (response.status === 401 && !path.startsWith("/auth")) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      throw error;
    }

    return payload as T;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
