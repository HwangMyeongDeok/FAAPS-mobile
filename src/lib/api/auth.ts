// ============================================================
// Mock auth API — emulates Google Sign-In.
// Swap these functions with real network calls when the backend
// is ready. The contract (function shape + return types) is the
// single source of truth for the whole mobile app.
// ============================================================

import {
  mockAdvisors,
  mockCurriculumVersions,
  mockMajors,
  mockSpecializations,
  mockStudentAdvisorAssignments,
  mockStudents,
  mockUsers,
  mutableState,
} from "@/lib/db/mockDb";
import type { AuthSession } from "@/types";

const NETWORK_DELAY_MS = 450;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SESSIONS_KEY = "faaps.mock.session";

export const authStorage = {
  load(): AuthSession | null {
    // Persistence is handled separately by AsyncStorage on the
    // call site; this is just a contract for tests.
    return null;
  },
};

/**
 * Mock "Sign in with Google" flow.
 *
 * For demo we always resolve as the team-member account
 * (Hoàng Minh Đức) so the QA build matches the developer's identity.
 * When the real Google OAuth is wired in, the success path will be
 * driven by the returned id_token instead.
 */
export async function signInWithGoogle(): Promise<AuthSession> {
  await wait(NETWORK_DELAY_MS);
  const user = mockUsers.find((u) => u.id === "u-student-duc")!;
  const student = mockStudents.find((s) => s.user_id === user.id)!;
  const session: AuthSession = {
    token: `mock.jwt.${user.id}.${Date.now()}`,
    user,
    student_code: student.student_code,
  };
  return session;
}

/** Mock sign out — clears session from caller side only. */
export async function signOut(): Promise<void> {
  await wait(150);
  // no-op on server; persistence handled by store
}

export { SESSIONS_KEY };
