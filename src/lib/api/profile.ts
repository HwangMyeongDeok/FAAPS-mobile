/**
 * Profile service — student profile, specialization.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 */
import type {
  User,
  Student,
  Specialization,
  Major,
  CurriculumVersion,
  Advisor,
  StudentAdvisorAssignment,
} from "@/types";
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import {
  mockStudents,
  mockUsers,
  mockMajors,
  mockCurriculumVersions,
  mockSpecializations,
  mockAdvisors,
  mockStudentAdvisorAssignments,
  mutableState,
} from "@/lib/db/mockDb";

export interface ProfileResponse {
  user: User;
  student: Student;
  major: Major;
  curriculum_version: CurriculumVersion;
  specialization: Specialization | null;
  available_specializations: Specialization[];
  advisor: {
    user: Pick<User, "id" | "full_name" | "email" | "phone" | "avatar_url">;
    advisor: Advisor;
    assignment: StudentAdvisorAssignment;
  } | null;
}

/** Translate a partial User patch → API request body shape */
export function toApiPatch(
  patch: Partial<Pick<User, "full_name" | "phone" | "email" | "avatar_url">>,
) {
  return {
    full_name: patch.full_name,
    phone: patch.phone,
    email: patch.email,
    avatar_url: patch.avatar_url,
  };
}

export async function getMyProfile(userId: string): Promise<ProfileResponse | null> {
  if (config.isMockMode) {
    await mockDelay();
    const user = mockUsers.find((u) => u.id === userId);
    const student = mockStudents.find((s) => s.user_id === userId);
    if (!user || !student) return null;

    const major = mockMajors.find((m) => m.id === student.major_id)!;
    const curriculum_version = mockCurriculumVersions.find(
      (cv) => cv.id === student.curriculum_version_id,
    )!;
    const selectedSpecId = mutableState.selectedSpecializationByStudent[userId] ?? null;
    const specialization = selectedSpecId
      ? mockSpecializations.find((sp) => sp.id === selectedSpecId) ?? null
      : null;
    const available_specializations = mockSpecializations.filter(
      (sp) =>
        sp.major_id === student.major_id &&
        sp.curriculum_version_id === student.curriculum_version_id,
    );

    const assignment =
      mockStudentAdvisorAssignments.find((sa) => sa.student_id === userId) ?? null;
    const advisorUser = assignment
      ? mockUsers.find((u) => u.id === assignment.advisor_id)
      : null;
    const advisorRecord = assignment
      ? mockAdvisors.find((a) => a.user_id === assignment.advisor_id)
      : null;
    const advisor =
      assignment && advisorUser && advisorRecord
        ? {
            user: {
              id: advisorUser.id,
              full_name: advisorUser.full_name,
              email: advisorUser.email,
              phone: advisorUser.phone ?? null,
              avatar_url: advisorUser.avatar_url ?? null,
            },
            advisor: advisorRecord,
            assignment,
          }
        : null;

    return {
      user,
      student,
      major,
      curriculum_version,
      specialization,
      available_specializations,
      advisor,
    };
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<ProfileResponse>(`/api/students/${userId}/profile`, { token });
}

export async function updateMyProfile(
  userId: string,
  patch: Partial<Pick<User, "full_name" | "phone" | "email" | "avatar_url">>,
) {
  if (config.isMockMode) {
    await mockDelay();
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return null;
    Object.assign(user, patch);
    return user;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.patch<User>(`/api/students/${userId}/profile`, toApiPatch(patch), { token });
}

export async function updateMySpecialization(
  userId: string,
  specializationId: string | null,
) {
  if (config.isMockMode) {
    await mockDelay();
    if (!(userId in mutableState.selectedSpecializationByStudent)) return false;
    mutableState.selectedSpecializationByStudent[userId] = specializationId;
    return true;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.put<{ ok: boolean }>(
    `/api/students/${userId}/specialization`,
    { specialization_id: specializationId },
    { token },
  );
}
