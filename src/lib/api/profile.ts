/**
 * Profile service — the signed-in student's academic profile and advisor.
 */
import { http, isNotFoundError } from "@/lib/http";
import type {
  AcademicProgress,
  StudentAdvisor,
  StudentProfile,
  UpdateProfileInput,
} from "@/types";

/** `GET /api/student/profile` */
export async function getMyProfile(): Promise<StudentProfile> {
  return http.get<StudentProfile>("/api/student/profile");
}

/** `PUT /api/student/profile` — the body is `{ fullName, phone }`. */
export async function updateMyProfile(
  input: UpdateProfileInput,
): Promise<StudentProfile> {
  return http.put<StudentProfile>("/api/student/profile", {
    fullName: input.fullName,
    phone: input.phone ?? undefined,
  });
}

/**
 * `GET /api/student/advisor` — the assigned advisor, or null.
 *
 * A 404 means the student simply has no advisor yet, which is a normal
 * state and resolves to `null`. Every other failure (500, timeout, offline)
 * is rethrown so the UI can show a retry instead of quietly pretending the
 * student has no advisor.
 */
export async function getMyAdvisor(): Promise<StudentAdvisor | null> {
  try {
    return await http.get<StudentAdvisor | null>("/api/student/advisor");
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

/** `GET /api/student/progress` */
export async function getMyProgress(): Promise<AcademicProgress> {
  return http.get<AcademicProgress>("/api/student/progress");
}
