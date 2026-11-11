/**
 * Typed fetch wrapper used by every service in `src/lib/api/*`.
 *
 * The FAAPS backend is session based:
 *   • the session lives in the `JSESSIONID` cookie,
 *   • a longer lived refresh token lives in the `FAAPS_REFRESH_TOKEN` cookie,
 *   • every mutating call must carry the CSRF token returned by
 *     `GET /api/auth/csrf` in the header the backend names.
 *
 * React Native's `fetch` is backed by the platform cookie store, so
 * `credentials: "include"` is what makes the session travel with the request.
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

/**
 * True when the backend answered 404 — "this record does not exist".
 *
 * This is a *valid state*, not a failure: a student with no advisor
 * assigned, or a roadmap that has never been generated, legitimately
 * produces a 404. Anything else — a 500, a timeout, an offline device — is
 * a real failure and must reach the UI so it can offer a retry instead of
 * silently pretending the data does not exist.
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export interface RequestOptions<TBody> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  signal?: AbortSignal;
  /** Extra headers to merge in */
  headers?: Record<string, string>;
  /** Override the global request timeout (ms). */
  timeoutMs?: number;
  /** Skip the automatic CSRF header (only used by the CSRF fetch itself). */
  skipCsrf?: boolean;
  /** Skip the automatic 401 → refresh → retry handling. */
  skipRefresh?: boolean;
}

export interface CsrfToken {
  headerName: string;
  token: string;
}

function buildUrl(path: string): string {
  const base = config.apiBaseUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/* ------------------------------------------------------------------ */
/* CSRF                                                                */
/* ------------------------------------------------------------------ */

let csrfToken: CsrfToken | null = null;
let csrfPromise: Promise<CsrfToken> | null = null;

/**
 * Fetch (and memoise) the CSRF token. The backend sets a non-http-only
 * `XSRF-TOKEN` cookie as a side effect, which the platform cookie store
 * keeps for us.
 */
export async function getCsrfToken(force = false): Promise<CsrfToken> {
  if (csrfToken && !force) return csrfToken;
  if (csrfPromise && !force) return csrfPromise;

  csrfPromise = (async () => {
    const res = await fetch(buildUrl("/api/auth/csrf"), {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new ApiError(res.status, "Could not obtain a CSRF token");
    }
    const body = (await res.json()) as CsrfToken;
    csrfToken = body;
    return body;
  })();

  try {
    return await csrfPromise;
  } finally {
    csrfPromise = null;
  }
}

/** Drop the cached token (after a logout or a rejected token). */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/* ------------------------------------------------------------------ */
/* Request                                                             */
/* ------------------------------------------------------------------ */

const SAFE_METHODS = new Set(["GET", "HEAD"]);

async function readErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

/** Extract a human-readable message from the backend error payload. */
function errorMessage(status: number, body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const candidate =
      record.message ?? record.error ?? record.detail ?? record.title;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return fallback;
}

async function send<TResponse>(
  path: string,
  opts: RequestOptions<unknown>,
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    signal,
    headers = {},
    timeoutMs = config.requestTimeoutMs,
    skipCsrf = false,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  if (!skipCsrf && !SAFE_METHODS.has(method)) {
    try {
      const csrf = await getCsrfToken();
      requestHeaders[csrf.headerName] = csrf.token;
    } catch {
      // No CSRF token available — the request will fail with a 403 and the
      // caller surfaces the backend message.
    }
  }

  const init: RequestInit = {
    method,
    signal: controller.signal,
    credentials: "include",
    headers: requestHeaders,
  };

  if (body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(buildUrl(path), init);

    if (!res.ok) {
      const errBody = await readErrorBody(res);
      throw new ApiError(
        res.status,
        errorMessage(res.status, errBody, `${method} ${path} failed: ${res.status}`),
        errBody,
      );
    }

    if (res.status === 204) return undefined as TResponse;

    const text = await res.text();
    if (!text) return undefined as TResponse;
    return JSON.parse(text) as TResponse;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

/**
 * Refresh the session. Uses the refresh cookie, so it needs no credentials
 * of its own — only the CSRF header.
 */
let refreshPromise: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(buildUrl("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        clearCsrfToken();
        return false;
      }
      // The rotated session gets a new CSRF token.
      await getCsrfToken(true).catch(() => undefined);
      return true;
    } catch {
      clearCsrfToken();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  opts: RequestOptions<TBody> = {},
): Promise<TResponse> {
  try {
    return await send<TResponse>(path, opts as RequestOptions<unknown>);
  } catch (error) {
    const isAuthError =
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403) &&
      !opts.skipRefresh;

    if (!isAuthError) throw error;

    const refreshed = await refreshSession();
    if (!refreshed) throw error;

    // Retry once with a fresh CSRF token.
    if (!SAFE_METHODS.has(opts.method ?? "GET")) {
      await getCsrfToken(true).catch(() => undefined);
    }
    return send<TResponse>(path, {
      ...(opts as RequestOptions<unknown>),
      skipRefresh: true,
    });
  }
}

// ---------------------------------------------------------------------------
// Ergonomic verb helpers
// ---------------------------------------------------------------------------

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
