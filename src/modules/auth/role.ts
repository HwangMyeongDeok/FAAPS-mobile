/**
 * Role helpers.
 *
 * The FAAPS mobile app is a **student-only** client: every screen under
 * `app/(app)/` renders the signed-in student's own academic data
 * (`/api/student/*`). There are no advisor or admin screens yet.
 *
 * If an advisor or an admin signs in on mobile, the backend happily
 * creates a session, but the app has nothing to show them — the student
 * endpoints would answer 403 or return an empty document. To make that
 * explicit (instead of a blank screen or a confusing empty state), the
 * sign-in flow detects a non-student role and refuses the session.
 */

/** The roles the backend can return (`RoleCode`). */
export type AppRole = "ADMIN" | "ADVISOR" | "STUDENT";

/** The only role the mobile app supports today. */
export const SUPPORTED_ROLE: AppRole = "STUDENT";

/**
 * The message shown when a non-student account tries to sign in.
 * Keep it in sync with the web client wording.
 */
export const UNSUPPORTED_ROLE_MESSAGE =
  "Ứng dụng di động hiện chỉ dành cho Sinh viên. Vui lòng sử dụng phiên bản Web dành cho Giảng viên/Quản trị viên.";

/** The title of the blocking alert. */
export const UNSUPPORTED_ROLE_ALERT_TITLE = "Không hỗ trợ trên di động";

/**
 * Normalise the `role` field of an `AuthSession`.
 *
 * The backend serialises it as an uppercase code, but the type allows any
 * string, so we compare case-insensitively and treat anything unknown as
 * "not a student".
 */
export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  const value = String(role).trim().toUpperCase();
  if (value === "STUDENT" || value === "ADVISOR" || value === "ADMIN") {
    return value;
  }
  return null;
}

/**
 * True when the given role may use the mobile app.
 *
 * Unknown/absent roles are allowed through — the backend is the source of
 * truth and may add roles that are student-facing later.
 */
export function isRoleSupportedByMobile(
  role: string | null | undefined,
): boolean {
  const normalized = normalizeRole(role);
  if (normalized === null) return true;
  return normalized === SUPPORTED_ROLE;
}
