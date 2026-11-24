/**
 * Auth service — sign in / sign out / session bootstrap.
 *
 * The backend authenticates with an HTTP session (`JSESSIONID`) plus a
 * refresh cookie. Everything here therefore relies on the platform cookie
 * jar; there is no token to attach to requests.
 */
import { clearCsrfToken, http } from "@/lib/http";
import { clearSession } from "@/lib/api/token";
import type {
  AuthCredentials,
  AuthSession,
  ForgotPasswordResult,
  ResetPasswordResult,
} from "@/types";

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

/**
 * `POST /api/auth/forgot-password` — ask the backend to email a reset link.
 *
 * Public endpoint (no session needed). The backend always answers with the
 * same generic message, so a successful call never reveals whether the
 * email exists — the UI must show that message verbatim.
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  return http.post<ForgotPasswordResult>("/api/auth/forgot-password", {
    email: email.trim(),
  });
}

/**
 * `POST /api/auth/reset-password` — set a new password with a reset token.
 *
 * Public endpoint (no session needed). The token comes from the link the
 * backend emailed; it is single-use and expires after 30 minutes.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  return http.post<ResetPasswordResult>("/api/auth/reset-password", {
    token: token.trim(),
    newPassword,
  });
}
