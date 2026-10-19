/**
 * Profile service.
 *
 * To wire to a real backend: set `EXPO_PUBLIC_API_BASE_URL` and replace the
 * mock branches with `request<...>` calls — signature of every exported
 * function stays the same.
 */
import type { User, Student, Specialization, Major, CurriculumVersion, Advisor, StudentAdvisorAssignment } from "@/types";
import { config } from "@/config/api";
import { request } from "@/lib/http";
import {
  mockStudents, mockUsers, mockMajors, mockCurriculumVersions,
  mockSpecializations, mockAdvisors, mockStudentAdvisorAssignments, mutableState,
} from "@/lib/db/mockDb";

const NETWORK_DELAY_MS = 600;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
export function toApiPatch(patch: Partial<Pick<User, "full_name" | "phone" | "email" | "avatar_url">>) {
  return {
    full_name:  patch.full_name,
    phone:      patch.phone,
    email:      patch.email,
    avatar_url: patch.avatar_url,
  };
}

export async function getMyProfile(userId: string): Promise<ProfileResponse | null> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    const user = mockUsers.find((u) => u.id === userId);
    const student = mockStudents.find((s) => s.user_id === userId);
    if (!user || !student) return null;

    const major = mockMajors.find((m) => m.id === student.major_id)!;
    const curriculum_version = mockCurriculumVersions.find((cv) => cv.id === student.curriculum_version_id)!;
    const selectedSpecId = mutableState.selectedSpecializationByStudent[userId] ?? null;
    const specialization = selectedSpecId
      ? mockSpecializations.find((sp) => sp.id === selectedSpecId) ?? null
      : null;
    const available_specializations = mockSpecializations.filter(
      (sp) => sp.major_id === student.major_id && sp.curriculum_version_id === student.curriculum_version_id
    );

    const assignment = mockStudentAdvisorAssignments.find((sa) => sa.student_id === userId) ?? null;
    const advisorUser = assignment ? mockUsers.find((u) => u.id === assignment.advisor_id) : null;
    const advisorRecord = assignment ? mockAdvisors.find((a) => a.user_id === assignment.advisor_id) : null;
    const advisor = assignment && advisorUser && advisorRecord
      ? {
          user: { id: advisorUser.id, full_name: advisorUser.full_name, email: advisorUser.email, phone: advisorUser.phone ?? null, avatar_url: advisorUser.avatar_url ?? null },
          advisor: advisorRecord,
          assignment,
        }
      : null;

    return { user, student, major, curriculum_version, specialization, available_specializations, advisor };
  }

  // Real backend:
  // return request<ProfileResponse>(`/students/${userId}/profile`);
  throw new Error("Not configured");
}

export async function updateMyProfile(userId: string, patch: Partial<Pick<User, "full_name" | "phone" | "email" | "avatar_url">>) {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return null;
    Object.assign(user, patch);
    return user;
  }
  // return request<User>(`/students/${userId}/profile`, { method: "PATCH", body: patch });
  throw new Error("Not configured");
}

export async function updateMySpecialization(userId: string, specializationId: string | null) {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    if (!(userId in mutableState.selectedSpecializationByStudent)) return false;
    mutableState.selectedSpecializationByStudent[userId] = specializationId;
    return true;
  }
  // return request<{ ok: boolean }>(`/students/${userId}/specialization`, { method: "PUT", body: { specialization_id: specializationId } });
  throw new Error("Not configured");
}