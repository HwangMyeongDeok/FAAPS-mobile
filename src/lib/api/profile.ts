// ============================================================
// Mock profile API (FE-S-2: Personal Profile)
// Aggregates user + student + curriculum + advisor info.
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
import type { ProfileResponse, Specialization, User } from "@/types";

// API contract for the PATCH /me profile endpoint.
export interface ProfileApiPatch {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getMyProfile(userId: string): Promise<ProfileResponse> {
  await wait(300);

  const user = mockUsers.find((u) => u.id === userId);
  const student = mockStudents.find((s) => s.user_id === userId);
  if (!user || !student) throw new Error("Student profile not found");

  const major = mockMajors.find((m) => m.id === student.major_id)!;
  const curriculumVersion = mockCurriculumVersions.find(
    (cv) => cv.id === student.curriculum_version_id,
  )!;

  const availableSpecializations = mockSpecializations.filter(
    (sp) => sp.curriculum_version_id === curriculumVersion.id,
  );

  const selectedSpId =
    mutableState.selectedSpecializationByStudent[userId] ?? null;
  const specialization =
    availableSpecializations.find((sp) => sp.id === selectedSpId) ?? null;

  // pick the active primary advisor
  const assignment = mockStudentAdvisorAssignments.find(
    (sa) => sa.student_id === userId && sa.status === "ACTIVE" && sa.is_primary,
  );
  let advisorBlock: ProfileResponse["advisor"] = null;
  if (assignment) {
    const advisor = mockAdvisors.find((a) => a.user_id === assignment.advisor_id);
    const advisorUser = mockUsers.find((u) => u.id === assignment.advisor_id);
    if (advisor && advisorUser) {
      advisorBlock = {
        user: {
          id: advisorUser.id,
          full_name: advisorUser.full_name,
          email: advisorUser.email,
          phone: advisorUser.phone ?? null,
          avatar_url: advisorUser.avatar_url ?? null,
        },
        advisor,
        assignment,
      };
    }
  }

  return {
    user,
    student,
    major,
    curriculum_version: curriculumVersion,
    specialization,
    available_specializations: availableSpecializations,
    advisor: advisorBlock,
  };
}

export async function updateMyProfile(
  userId: string,
  patch: ProfileApiPatch,
) {
  await wait(350);
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  if (patch.full_name !== undefined && patch.full_name !== null) user.full_name = patch.full_name;
  if (patch.phone !== undefined && patch.phone !== null) user.phone = patch.phone;
  if (patch.email !== undefined && patch.email !== null) user.email = patch.email;
  if (patch.avatar_url !== undefined) user.avatar_url = patch.avatar_url;
  return user;
}

// Bridge between form layer and API layer — used by the React Query hook.
// Allows optional / null fields on the form side without leaking that into
// the API contract.
export function toApiPatch(
  formPatch: Partial<Pick<User, "full_name" | "email" | "phone" | "avatar_url">>,
): ProfileApiPatch {
  const out: ProfileApiPatch = {};
  if (formPatch.full_name !== undefined) out.full_name = formPatch.full_name;
  if (formPatch.email !== undefined) out.email = formPatch.email;
  if (formPatch.phone !== undefined) out.phone = formPatch.phone;
  if (formPatch.avatar_url !== undefined) out.avatar_url = formPatch.avatar_url;
  return out;
}

export async function updateMySpecialization(
  userId: string,
  specializationId: string | null,
): Promise<Specialization | null> {
  await wait(250);
  mutableState.selectedSpecializationByStudent[userId] = specializationId;
  if (!specializationId) return null;
  const sp = mockSpecializations.find((s) => s.id === specializationId);
  if (!sp) throw new Error("Specialization not found");
  return sp;
}
