// ============================================================
// FAAPS-mobile domain types
// Mirror of the DBML schema. Field names use snake_case to match
// the backend API contract (which we will mock in this app).
// ============================================================

export type RoleCode = "ADMIN" | "ADVISOR" | "STUDENT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface User {
  id: string;
  role_id: string;
  email: string;
  auth_provider: AuthProvider;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: UserStatus;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

export interface Student {
  user_id: string;
  student_code: string;
  major_id: string;
  curriculum_version_id: string;
  enrollment_semester_id: string;
  expected_graduation_semester_id?: string | null;
  current_semester: number;
  current_gpa: number; // 0.00 - 10.00
  total_credits_earned: number;
  academic_status:
    | "ACTIVE"
    | "PROBATION"
    | "SUSPENDED"
    | "GRADUATED"
    | "WITHDRAWN"
    | "LEAVE_OF_ABSENCE";
}

export interface Advisor {
  user_id: string;
  advisor_code: string;
  specialization?: string | null;
  max_advisees: number;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}

export interface StudentAdvisorAssignment {
  id: string;
  student_id: string;
  advisor_id: string;
  group_name?: string | null;
  assigned_date: string; // ISO date
  end_date?: string | null;
  is_primary: boolean;
  status: "ACTIVE" | "COMPLETED" | "TRANSFERRED";
}

export interface Major {
  id: string;
  code: string;
  name: string;
  total_credits: number;
  duration_years: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface CurriculumVersion {
  id: string;
  major_id: string;
  version: string; // K18, K19 ...
  name: string;
  effective_from_semester_id: string;
  effective_to_semester_id?: string | null;
  is_current: boolean;
  status: "ACTIVE" | "INACTIVE";
}

export interface Specialization {
  id: string;
  major_id: string;
  curriculum_version_id: string;
  code: string;
  name: string;
  description?: string | null;
}

// ============================================================
// API helper types
// ============================================================

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

export interface AuthSession {
  token: string;
  user: User;
  student_code: string;
}
