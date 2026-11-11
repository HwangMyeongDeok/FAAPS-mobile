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

/** Sign out — invalidates the server session and clears the cookies. */
export async function signOut(): Promise<void> {
  try {
    await http.post<void>("/api/auth/logout");
  } catch {
    /* the local session is dropped either way */
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
