// ============================================================
// FAAPS-mobile mock DB
// In-memory seed that mimics the FAAPS backend. Once the real API
// is available, only the functions in `src/lib/api/*` need to be
// swapped out — every screen talks to those functions, not to this
// file directly.
// ============================================================

import type {
  Advisor,
  CurriculumVersion,
  Major,
  Specialization,
  Student,
  StudentAdvisorAssignment,
  User,
} from "@/types";

export const mockUsers: User[] = [
  {
    id: "u-student-1",
    role_id: "r-student",
    email: "thiencdse173019@fpt.edu.vn",
    auth_provider: "GOOGLE",
    full_name: "Châu Đức Thiện",
    phone: "0945274803",
    avatar_url: null,
    status: "ACTIVE",
    email_verified_at: "2026-09-10T00:00:00Z",
    last_login_at: "2026-10-15T08:30:00Z",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "u-student-2",
    role_id: "r-student",
    email: "synnvse160343@fpt.edu.vn",
    auth_provider: "GOOGLE",
    full_name: "Nguyễn Ngọc Vệ Sỹ",
    phone: "0983527534",
    avatar_url: null,
    status: "ACTIVE",
    email_verified_at: "2026-09-10T00:00:00Z",
    last_login_at: "2026-10-17T10:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "u-student-duc",
    role_id: "r-student",
    email: "duchmse173564@fpt.edu.vn",
    auth_provider: "GOOGLE",
    full_name: "Hoàng Minh Đức",
    phone: "0879395607",
    avatar_url: null,
    status: "ACTIVE",
    email_verified_at: "2026-09-10T00:00:00Z",
    last_login_at: "2026-10-18T21:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "u-advisor-1",
    role_id: "r-advisor",
    email: "thongnt@fe.edu.vn",
    auth_provider: "LOCAL",
    full_name: "Nguyễn Trí Thông",
    phone: "0907973989",
    avatar_url: null,
    status: "ACTIVE",
    email_verified_at: "2026-08-20T00:00:00Z",
    created_at: "2026-08-01T00:00:00Z",
  },
];

export const mockStudents: Student[] = [
  {
    user_id: "u-student-1",
    student_code: "SE173019",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    enrollment_semester_id: "s-fa2026",
    expected_graduation_semester_id: "s-sp2030",
    current_semester: 5,
    current_gpa: 7.85,
    total_credits_earned: 78,
    academic_status: "ACTIVE",
  },
  {
    user_id: "u-student-2",
    student_code: "SE160343",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    enrollment_semester_id: "s-sp2026",
    expected_graduation_semester_id: "s-su2030",
    current_semester: 7,
    current_gpa: 6.42,
    total_credits_earned: 96,
    academic_status: "ACTIVE",
  },
  {
    user_id: "u-student-duc",
    student_code: "SE173564",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    enrollment_semester_id: "s-fa2026",
    expected_graduation_semester_id: "s-sp2030",
    current_semester: 5,
    current_gpa: 7.42,
    total_credits_earned: 80,
    academic_status: "ACTIVE",
  },
];

export const mockAdvisors: Advisor[] = [
  {
    user_id: "u-advisor-1",
    advisor_code: "ADV001",
    specialization: "Software Engineering, AI",
    max_advisees: 30,
    status: "ACTIVE",
  },
];

export const mockStudentAdvisorAssignments: StudentAdvisorAssignment[] = [
  {
    id: "saa-1",
    student_id: "u-student-1",
    advisor_id: "u-advisor-1",
    group_name: "K19 - SE",
    assigned_date: "2026-09-15",
    end_date: null,
    is_primary: true,
    status: "ACTIVE",
  },
  {
    id: "saa-2",
    student_id: "u-student-2",
    advisor_id: "u-advisor-1",
    group_name: "K19 - SE",
    assigned_date: "2026-09-15",
    end_date: null,
    is_primary: true,
    status: "ACTIVE",
  },
  {
    id: "saa-3",
    student_id: "u-student-duc",
    advisor_id: "u-advisor-1",
    group_name: "K19 - SE",
    assigned_date: "2026-09-15",
    end_date: null,
    is_primary: true,
    status: "ACTIVE",
  },
];

export const mockMajors: Major[] = [
  {
    id: "m-se",
    code: "SE",
    name: "Software Engineering",
    total_credits: 150,
    duration_years: 4,
    status: "ACTIVE",
  },
];

export const mockCurriculumVersions: CurriculumVersion[] = [
  {
    id: "cv-se-k19",
    major_id: "m-se",
    version: "K19",
    name: "K19 - Software Engineering",
    effective_from_semester_id: "s-fa2026",
    effective_to_semester_id: null,
    is_current: true,
    status: "ACTIVE",
  },
];

export const mockSpecializations: Specialization[] = [
  {
    id: "sp-ai",
    curriculum_version_id: "cv-se-k19",
    code: "AI",
    name: "Artificial Intelligence",
    description: "Focus on machine learning, deep learning và AI applications.",
  },
  {
    id: "sp-cloud",
    curriculum_version_id: "cv-se-k19",
    code: "CL",
    name: "Cloud Computing",
    description: "Cloud architecture, DevOps và distributed systems.",
  },
  {
    id: "sp-iot",
    curriculum_version_id: "cv-se-k19",
    code: "IoT",
    name: "Internet of Things",
    description: "Embedded systems, sensor networks và edge computing.",
  },
];

// In-memory mutable state for fields the user can update.
// Keyed by user_id so any student can change specialization.
export const mutableState: {
  selectedSpecializationByStudent: Record<string, string | null>;
} = {
  selectedSpecializationByStudent: {
    "u-student-1": null,
    "u-student-2": null,
    "u-student-duc": null,
  },
};
