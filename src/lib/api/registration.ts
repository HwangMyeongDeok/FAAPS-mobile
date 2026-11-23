/**
 * Registration service — public endpoints used before an account exists.
 *
 * These two calls do not need a session: the backend exposes them under
 * `/api/auth/register*` and they are reachable while signed out.
 */
import { http } from "@/lib/http";

/** One curriculum the student can register into. */
export interface CurriculumChoice {
  id: string;
  version: string;
  name: string;
  majorCode: string | null;
  majorName: string | null;
}

/**
 * `GET /api/auth/register/curriculums`
 *
 * Public — no session required.
 */
export async function getRegisterCurriculums(): Promise<CurriculumChoice[]> {
  return http.get<CurriculumChoice[]>("/api/auth/register/curriculums");
}

/**
 * `POST /api/auth/register`
 *
 * The backend binds the body to `RegisterRequest`:
 *   fullName, email, password, dateOfBirth, studentCode, phone
 * and an optional `curriculumVersionId`.
 *
 * `dateOfBirth` must be an ISO local date (`yyyy-MM-dd`) because it is
 * deserialised into a `LocalDate`.
 *
 * On success the backend creates the session and sets the auth cookies, so
 * the caller is already signed in afterwards.
 */
export async function registerStudent(input: {
  fullName: string;
  email: string;
  password: string;
  studentCode: string;
  phone: string;
  dateOfBirth: string;
  curriculumVersionId?: string;
}): Promise<{ id: string; fullName: string; email: string; role: string; status: string }> {
  return http.post("/api/auth/register", {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    studentCode: input.studentCode,
    phone: input.phone,
    dateOfBirth: input.dateOfBirth,
    curriculumVersionId: input.curriculumVersionId || undefined,
  });
}
