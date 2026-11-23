/**
 * Auth service — sign in / sign out / session bootstrap.
 *
 * The backend authenticates with an HTTP session (`JSESSIONID`) plus a
 * refresh cookie. Everything here therefore relies on the platform cookie
 * jar; there is no token to attach to requests.
 */
import { clearCsrfToken, http } from "@/lib/http";
import { clearSession } from "@/lib/api/token";
import type { AuthCredentials, AuthSession } from "@/types";

/**
 * Sign in with an FPT email address and a password.
 *
 * The backend responds with the `AuthSession` and sets the session cookies.
 */
export async function signIn(credentials: AuthCredentials): Promise<AuthSession> {
  const session = await http.post<AuthSession>("/api/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return session;
}

/**
 * Sign out — invalidates the server session (best-effort) and clears local state.
 *
 * NOTE (GAP-1): backend `AuthController` hiện KHÔNG expose `POST /api/auth/logout`
 * nên lời gọi dưới đây luôn trả 404. Lỗi được nuốt có chủ ý vì logout trên
 * mobile là thao tác local-first: dù server có chết hay endpoint chưa tồn tại,
 * app vẫn PHẢI clear CSRF token + persisted session + đưa store về
 * `unauthenticated` để user không bị kẹt ở màn hình protected.
 * Tuyệt đối KHÔNG `console.log/console.warn` ở đây để tránh rác log trên
 * production khi mọi lần sign-out đều đi qua nhánh catch này.
 */
export async function signOut(): Promise<void> {
  try {
    await http.post<void>("/api/auth/logout");
  } catch {
    /* GAP-1: endpoint chưa tồn tại ở BE (404) — bỏ qua, vẫn clear session local bên dưới. */
  }
  clearCsrfToken();
  await clearSession();
}

/** The current session, or null when the cookie has expired. */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    return await http.get<AuthSession>("/api/auth/me");
  } catch {
    return null;
  }
}

/**
 * Restore the session from the refresh cookie after the app was closed.
 * Returns null when the refresh token is gone or expired.
 */
export async function restoreSession(): Promise<AuthSession | null> {
  try {
    return await http.post<AuthSession>("/api/auth/refresh", undefined, {
      skipRefresh: true,
    });
  } catch {
    return null;
  }
}
