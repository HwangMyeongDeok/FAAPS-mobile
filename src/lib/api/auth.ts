/**
 * Auth service — sign in / sign out / session refresh.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * `config.isMockMode` decides which branch runs. To wire the real backend:
 *   1. Set `extra.isMockMode = false` (and `apiBaseUrl`) in app.json, or
 *      `EXPO_PUBLIC_MOCK_MODE=false` in .env
 *   2. The `else` branch below already contains the real calls.
 */
import type { AuthSession, User } from "@/types";
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken, SESSIONS_KEY } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import { mockUsers, mockStudents } from "@/lib/db/mockDb";

export { SESSIONS_KEY };

/**
 * Sign in with Google.
 *
 * Mock: picks the "u-student-duc" account so the demo always has consistent
 * data. Real: exchanges a Google ID token with the backend.
 *
 * @param googleIdToken ID token obtained from Google Sign-In. In mock mode
 *   this argument is ignored.
 */
export async function signInWithGoogle(googleIdToken?: string): Promise<AuthSession> {
  if (config.isMockMode) {
    await mockDelay();
    const user = mockUsers.find((u) => u.id === "u-student-duc")!;
    const student = mockStudents.find((s) => s.user_id === user.id)!;
    return {
      token: `mock.jwt.${user.id}.${Date.now()}`,
      user,
      student_code: student.student_code,
    };
  }

  // TODO: Wire BE later — pass the real Google ID token from expo-auth-session
  // so the backend can verify it and issue a FAAPS session.
  if (!googleIdToken) {
    throw new Error("Google ID token is required when EXPO_PUBLIC_MOCK_MODE=false.");
  }
  return http.post<AuthSession>("/api/auth/google", { idToken: googleIdToken });
}

export async function signOut(): Promise<void> {
  if (config.isMockMode) {
    await mockDelay(300);
    return;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  await http.post<void>("/api/auth/logout", undefined, { token });
}

export async function refreshSession(token: string): Promise<User | null> {
  if (config.isMockMode) {
    await mockDelay(300);
    const match = mockUsers.find(
      (u) => `mock.jwt.${u.id}` === token.slice(0, token.lastIndexOf(".")),
    );
    return match ?? null;
  }

  // TODO: Wire BE later
  return http.get<User>("/api/auth/me", { token });
}
