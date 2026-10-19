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
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    code: "AI",
    name: "Artificial Intelligence",
    description: "Focus on machine learning, deep learning và AI applications.",
  },
  {
    id: "sp-cloud",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    code: "CL",
    name: "Cloud Computing",
    description: "Cloud architecture, DevOps và distributed systems.",
  },
  {
    id: "sp-iot",
    major_id: "m-se",
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

// ── Additional seed data ─────────────────────────────────────────────────────

export interface Semester {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed";
}

export interface CurriculumCourse {
  id: string;
  curriculum_version_id: string;
  course_code: string;
  name: string;
  credits: number;
  type: "CORE" | "ELECTIVE" | "PRACTICUM" | "PROJECT";
  semester: number;
  prerequisites: string[];
  completed: boolean;
}

export interface Conversation {
  id: string;
  student_id: string;
  advisor_id: string;
  subject: string;
  last_message_at: string;
  unread_count: number;
  status: "active" | "archived";
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "student" | "advisor" | "system";
  content: string;
  sent_at: string;
  read_at: string | null;
}

export const mockSemesters: Semester[] = [
  { id: "s-fa2024", label: "Fall 2024",   start_date: "2024-08-01", end_date: "2024-12-31", status: "completed" },
  { id: "s-sp2025", label: "Spring 2025", start_date: "2025-01-01", end_date: "2025-05-31", status: "completed" },
  { id: "s-su2025", label: "Summer 2025", start_date: "2025-06-01", end_date: "2025-08-31", status: "completed" },
  { id: "s-fa2025", label: "Fall 2025",   start_date: "2025-09-01", end_date: "2025-12-31", status: "completed" },
  { id: "s-sp2026", label: "Spring 2026", start_date: "2026-01-01", end_date: "2026-05-31", status: "active"    },
  { id: "s-su2026", label: "Summer 2026", start_date: "2026-06-01", end_date: "2026-08-31", status: "upcoming"  },
  { id: "s-fa2026", label: "Fall 2026",   start_date: "2026-09-01", end_date: "2026-12-31", status: "upcoming"  },
  { id: "s-sp2027", label: "Spring 2027", start_date: "2027-01-01", end_date: "2027-05-31", status: "upcoming"  },
];

export const mockCurriculumCourses: CurriculumCourse[] = [
  { id: "c1", curriculum_version_id: "cv-se-k19", course_code: "PRM201",  name: "Programming Fundamentals",     credits: 4,  type: "CORE",      semester: 1, prerequisites: [],          completed: true  },
  { id: "c2", curriculum_version_id: "cv-se-k19", course_code: "DBI202",  name: "Database Systems",              credits: 3,  type: "CORE",      semester: 2, prerequisites: ["c1"],      completed: true  },
  { id: "c3", curriculum_version_id: "cv-se-k19", course_code: "OSG202",  name: "Operating Systems",              credits: 3,  type: "CORE",      semester: 2, prerequisites: ["c1"],      completed: true  },
  { id: "c4", curriculum_version_id: "cv-se-k19", course_code: "WED301",  name: "Web Application Development",   credits: 3,  type: "CORE",      semester: 3, prerequisites: ["c2"],      completed: true  },
  { id: "c5", curriculum_version_id: "cv-se-k19", course_code: "CNM301",  name: "Computer Networks",             credits: 3,  type: "CORE",      semester: 3, prerequisites: ["c3"],      completed: true  },
  { id: "c6", curriculum_version_id: "cv-se-k19", course_code: "AIA301",  name: "Artificial Intelligence",       credits: 3,  type: "CORE",      semester: 4, prerequisites: ["c1"],      completed: false },
  { id: "c7", curriculum_version_id: "cv-se-k19", course_code: "SRE301",  name: "Software Engineering",          credits: 4,  type: "CORE",      semester: 4, prerequisites: ["c2"],      completed: false },
  { id: "c8", curriculum_version_id: "cv-se-k19", course_code: "MLO302",  name: "Machine Learning Operations",   credits: 3,  type: "ELECTIVE",  semester: 5, prerequisites: ["c6"],      completed: false },
  { id: "c9", curriculum_version_id: "cv-se-k19", course_code: "CAP401",  name: "Capstone Project I",            credits: 4,  type: "PROJECT",   semester: 7, prerequisites: ["c7"],      completed: false },
  { id: "c10",curriculum_version_id: "cv-se-k19", course_code: "CAP402",  name: "Capstone Project II",           credits: 4,  type: "PROJECT",   semester: 8, prerequisites: ["c9"],      completed: false },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    student_id: "u-student-1",
    advisor_id: "u-advisor-1",
    subject: "Kế hoạch học tập HK2 2026",
    last_message_at: "2026-10-18T14:30:00Z",
    unread_count: 2,
    status: "active",
  },
  {
    id: "conv-2",
    student_id: "u-student-1",
    advisor_id: "u-advisor-1",
    subject: "Chọn chuyên ngành AI hay Cloud?",
    last_message_at: "2026-10-15T09:00:00Z",
    unread_count: 0,
    status: "active",
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversation_id: "conv-1",
    role: "student",
    content: "Thầy ơi, em muốn hỏi về kế hoạch học tập HK2 2026.",
    sent_at: "2026-10-18T14:00:00Z",
    read_at: "2026-10-18T14:05:00Z",
  },
  {
    id: "msg-2",
    conversation_id: "conv-1",
    role: "advisor",
    content: "Chào em, cảm ơn em đã liên hệ. Để tôi xem qua hồ sơ nhé.",
    sent_at: "2026-10-18T14:20:00Z",
    read_at: "2026-10-18T14:25:00Z",
  },
  {
    id: "msg-3",
    conversation_id: "conv-1",
    role: "advisor",
    content: "Em nên đăng ký thêm 2 môn CORE và 1 môn ELECTIVE cho HK2.",
    sent_at: "2026-10-18T14:30:00Z",
    read_at: null,
  },
];
