/**
 * Profile service — the signed-in student's academic profile and advisor.
 */
import { http } from "@/lib/http";
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

/** `GET /api/student/advisor` — the assigned advisor, or null. */
export async function getMyAdvisor(): Promise<StudentAdvisor | null> {
  try {
    return await http.get<StudentAdvisor | null>("/api/student/advisor");
  } catch {
    return null;
  }
}

/** `GET /api/student/progress` */
export async function getMyProgress(): Promise<AcademicProgress> {
  return http.get<AcademicProgress>("/api/student/progress");
}
