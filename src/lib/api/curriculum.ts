/**
 * Curriculum service — curriculum versions, courses, majors, semesters, specializations.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 */
import type { Semester, CurriculumCourse } from "@/lib/db/mockDb";
import type { CurriculumVersion, Major, Specialization } from "@/types";
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import {
  mockCurriculumVersions,
  mockCurriculumCourses,
  mockMajors,
  mockSemesters,
  mockSpecializations,
} from "@/lib/db/mockDb";

export async function getCurriculum(cVersionId: string): Promise<CurriculumVersion | null> {
  if (config.isMockMode) {
    await mockDelay();
    return mockCurriculumVersions.find((v) => v.id === cVersionId) ?? null;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<CurriculumVersion>(`/api/curriculum-versions/${cVersionId}`, { token });
}

export async function getCourses(cVersionId: string): Promise<CurriculumCourse[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockCurriculumCourses.filter(
      (c) => c.curriculum_version_id === cVersionId,
    );
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<CurriculumCourse[]>(`/api/curriculum-versions/${cVersionId}/courses`, { token });
}

export async function getMajors(): Promise<Major[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockMajors;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<Major[]>("/api/majors", { token });
}

export async function getSemesters(): Promise<Semester[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockSemesters;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<Semester[]>("/api/semesters", { token });
}

export async function getSpecializations(majorId: string): Promise<Specialization[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockSpecializations.filter((s) => s.major_id === majorId);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<Specialization[]>(`/api/majors/${majorId}/specializations`, { token });
}
