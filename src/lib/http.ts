/**
 * Minimal typed fetch wrapper used by every service in `src/lib/api/*`.
 *
 * - Adds `Authorization: Bearer <token>` when an auth token is provided.
 * - Throws `ApiError` on non-2xx so callers can `try/catch` consistently.
 * - JSON-encoded request bodies by default.
 * - Applies a request timeout via `AbortController`.
 *
 * Replace with axios / ky later if you need interceptors & retries.
 */

import { config } from "@/config/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions<TBody> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  token?: string | null;
  signal?: AbortSignal;
  /** Extra headers to merge in */
  headers?: Record<string, string>;
  /** Override the global request timeout (ms). */
  timeoutMs?: number;
}

function buildUrl(path: string): string {
  const base = config.apiBaseUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  opts: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    token,
    signal,
    headers = {},
    timeoutMs = config.requestTimeoutMs,
  } = opts;

  // Combine the caller's signal with our timeout signal.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  const init: RequestInit = {
    method,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(buildUrl(path), init);

    if (!res.ok) {
      let errBody: unknown;
      try {
        errBody = await res.json();
      } catch {
        /* ignore — non-JSON error body */
      }
      throw new ApiError(res.status, `${method} ${path} failed: ${res.status}`, errBody);
    }

    // 204 / empty body
    if (res.status === 204) return undefined as TResponse;

    const text = await res.text();
    if (!text) return undefined as TResponse;
    return JSON.parse(text) as TResponse;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

// ── Ergonomic verb helpers ───────────────────────────────────────────────────

export const http = {
  get: <T>(path: string, opts: Omit<RequestOptions<never>, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "GET" }),

  post: <T, TBody = unknown>(path: string, body?: TBody, opts: Omit<RequestOptions<TBody>, "method" | "body"> = {}) =>
    request<T, TBody>(path, { ...opts, method: "POST", body }),

  put: <T, TBody = unknown>(path: string, body?: TBody, opts: Omit<RequestOptions<TBody>, "method" | "body"> = {}) =>
    request<T, TBody>(path, { ...opts, method: "PUT", body }),

  patch: <T, TBody = unknown>(path: string, body?: TBody, opts: Omit<RequestOptions<TBody>, "method" | "body"> = {}) =>
    request<T, TBody>(path, { ...opts, method: "PATCH", body }),

  delete: <T>(path: string, opts: Omit<RequestOptions<never>, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
