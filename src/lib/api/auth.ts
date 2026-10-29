/**
 * Auth service.
 *
 * ── HOW TO WIRE TO A REAL BACKEND ────────────────────────────────────────────
 * 1. Set `EXPO_PUBLIC_API_BASE_URL` in app.json → extra.
 * 2. In `signInWithGoogle()` below, replace the mock branch with:
 *        return request<AuthSession>("/auth/google", { method: "POST" });
 * 3. Everything downstream (store, screens, queries) is unaffected.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { AuthSession, User } from "@/types";
import { config } from "@/config/api";
// Reserved for wiring the real backend — the endpoint call below is still
// commented out, so ESLint would otherwise flag this as an unused import.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { request } from "@/lib/http";
import { mockUsers, mockStudents } from "@/lib/db/mockDb";

const NETWORK_DELAY_MS = 900;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** AsyncStorage key for the persisted session object */
export const SESSIONS_KEY = "faaps.auth.session";

/**
 * Sign in with Google.
 *
 * Mock implementation picks the "u-student-duc" account so the demo always
 * has consistent data. Real implementation will exchange a Google ID token
 * with the backend.
 */
export async function signInWithGoogle(): Promise<AuthSession> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    const user = mockUsers.find((u) => u.id === "u-student-duc")!;
    const student = mockStudents.find((s) => s.user_id === user.id)!;
    return {
      token: `mock.jwt.${user.id}.${Date.now()}`,
      user,
      student_code: student.student_code,
    };
  }

  // Real backend example — TODO when ready:
  // return request<AuthSession>("/auth/google", { method: "POST", body: { idToken } });
  throw new Error("Real auth endpoint not configured. Set EXPO_PUBLIC_API_BASE_URL.");
}

export async function signOut(): Promise<void> {
  if (config.isMockMode) {
    await wait(300);
    return;
  }
  // await request<void>("/auth/logout", { method: "POST", token: currentToken });
}

export async function refreshSession(token: string): Promise<User | null> {
  if (config.isMockMode) {
    await wait(300);
    const match = mockUsers.find((u) => `mock.jwt.${u.id}` === token.slice(0, token.lastIndexOf(".")));
    return match ?? null;
  }
  // return request<User>("/auth/me", { token });
  return null;
}