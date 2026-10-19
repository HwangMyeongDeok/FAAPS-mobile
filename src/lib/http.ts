/**
 * Minimal typed fetch wrapper.
 *
 * - Adds `Authorization: Bearer <token>` when an auth token is provided.
 * - Throws `ApiError` on non-2xx so callers can `try/catch` consistently.
 * - JSON-encoded request bodies by default.
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

interface RequestOptions<TBody> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  token?: string | null;
  signal?: AbortSignal;
  /** Extra headers to merge in */
  headers?: Record<string, string>;
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  opts: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, token, signal, headers = {} } = opts;

  const init: RequestInit = {
    method,
    signal,
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

  const url = `${config.apiBaseUrl}${path}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    let errBody: unknown;
    try { errBody = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, `${method} ${path} failed: ${res.status}`, errBody);
  }

  // 204 / empty body
  if (res.status === 204) return undefined as TResponse;
  return (await res.json()) as TResponse;
}