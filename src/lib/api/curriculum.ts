/**
 * Curriculum service.
 */
import type { Semester, CurriculumCourse } from "@/lib/db/mockDb";
import type { CurriculumVersion, Major, Specialization } from "@/types";
import { config } from "@/config/api";
import { request } from "@/lib/http";
import {
  mockCurriculumVersions, mockCurriculumCourses, mockMajors,
  mockSemesters, mockSpecializations,
} from "@/lib/db/mockDb";

const NETWORK_DELAY_MS = 500;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getCurriculum(cVersionId: string): Promise<CurriculumVersion | null> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockCurriculumVersions.find((v) => v.id === cVersionId) ?? null;
  }
  // return request<CurriculumVersion>(`/curriculum-versions/${cVersionId}`);
  throw new Error("Not configured");
}

export async function getCourses(cVersionId: string): Promise<CurriculumCourse[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockCurriculumCourses.filter((c) => c.curriculum_version_id === cVersionId);
  }
  // return request<CurriculumCourse[]>(`/curriculum-versions/${cVersionId}/courses`);
  throw new Error("Not configured");
}

export async function getMajors(): Promise<Major[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockMajors;
  }
  // return request<Major[]>("/majors");
  throw new Error("Not configured");
}

export async function getSemesters(): Promise<Semester[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockSemesters;
  }
  // return request<Semester[]>("/semesters");
  throw new Error("Not configured");
}

export async function getSpecializations(majorId: string): Promise<Specialization[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockSpecializations.filter((s) => s.major_id === majorId);
  }
  // return request<Specialization[]>(`/majors/${majorId}/specializations`);
  throw new Error("Not configured");
}