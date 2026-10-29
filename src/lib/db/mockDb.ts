// ============================================================
// FAAPS-mobile mock DB
// ------------------------------------------------------------
// In-memory seed that mimics the FAAPS backend. Every service in
// `src/lib/api/*` reads from this file when `config.isMockMode` is on.
//
// This is the SINGLE source of truth for mock data — notifications,
// conversations and messages live here too, so there is no scattered
// hardcoded data anywhere else in the codebase.
//
// Once the real API is available, only the functions in `src/lib/api/*`
// need to be swapped out — every screen talks to those functions, not to
// this file directly.
// ============================================================

import type {
  Advisor,
  AppNotification,
  CurriculumVersion,
  Major,
  Specialization,
  Student,
  StudentAdvisorAssignment,
  User,
} from "@/types";

// ── Core identity ────────────────────────────────────────────────────────────

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
    id: "u-student-4",
    role_id: "r-student",
    email: "linhpnse171908@fpt.edu.vn",
    auth_provider: "GOOGLE",
    full_name: "Phạm Ngọc Linh",
    phone: "0963820147",
    avatar_url: null,
    status: "ACTIVE",
    email_verified_at: "2026-09-12T00:00:00Z",
    last_login_at: "2026-10-19T07:15:00Z",
    created_at: "2026-09-05T00:00:00Z",
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
  {
    id: "u-advisor-2",
    role_id: "r-advisor",
    email: "linhnt@fe.edu.vn",
    auth_provider: "LOCAL",
    full_name: "Trần Ngọc Linh",
    phone: "0903124578",
    avatar_url: null,
    status: "ACTIVE",
    email_verified_at: "2026-08-22T00:00:00Z",
    created_at: "2026-08-02T00:00:00Z",
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
  {
    user_id: "u-student-4",
    student_code: "SE171908",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    enrollment_semester_id: "s-fa2026",
    expected_graduation_semester_id: "s-su2030",
    current_semester: 5,
    current_gpa: 8.1,
    total_credits_earned: 82,
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
  {
    user_id: "u-advisor-2",
    advisor_code: "ADV002",
    specialization: "Cloud Computing, DevOps",
    max_advisees: 25,
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
  {
    id: "saa-4",
    student_id: "u-student-4",
    advisor_id: "u-advisor-2",
    group_name: "K19 - SE",
    assigned_date: "2026-09-18",
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
  {
    id: "sp-data",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    code: "DS",
    name: "Data Science",
    description: "Data engineering, analytics và trực quan hoá dữ liệu.",
  },
  {
    id: "sp-game",
    major_id: "m-se",
    curriculum_version_id: "cv-se-k19",
    code: "GD",
    name: "Game Development",
    description: "Game design, realtime rendering và multiplatform builds.",
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
    "u-student-4": null,
  },
};

// ── Semesters ────────────────────────────────────────────────────────────────

export interface Semester {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed";
}

export const mockSemesters: Semester[] = [
  { id: "s-fa2024", label: "Fall 2024",   start_date: "2024-08-01", end_date: "2024-12-31", status: "completed" },
  { id: "s-sp2025", label: "Spring 2025", start_date: "2025-01-01", end_date: "2025-05-31", status: "completed" },
  { id: "s-su2025", label: "Summer 2025", start_date: "2025-06-01", end_date: "2025-08-31", status: "completed" },
  { id: "s-fa2025", label: "Fall 2025",   start_date: "2025-09-01", end_date: "2025-12-31", status: "completed" },
  { id: "s-sp2026", label: "Spring 2026", start_date: "2026-01-01", end_date: "2026-05-31", status: "completed" },
  { id: "s-su2026", label: "Summer 2026", start_date: "2026-06-01", end_date: "2026-08-31", status: "completed" },
  { id: "s-fa2026", label: "Fall 2026",   start_date: "2026-09-01", end_date: "2026-12-31", status: "active"    },
  { id: "s-sp2027", label: "Spring 2027", start_date: "2027-01-01", end_date: "2027-05-31", status: "upcoming"  },
  { id: "s-su2027", label: "Summer 2027", start_date: "2027-06-01", end_date: "2027-08-31", status: "upcoming"  },
  { id: "s-fa2027", label: "Fall 2027",   start_date: "2027-09-01", end_date: "2027-12-31", status: "upcoming"  },
  { id: "s-sp2028", label: "Spring 2028", start_date: "2028-01-01", end_date: "2028-05-31", status: "upcoming"  },
  { id: "s-su2028", label: "Summer 2028", start_date: "2028-06-01", end_date: "2028-08-31", status: "upcoming"  },
];

// ── Courses ─────────────────────────────────────────────────────────────────

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

/**
 * 50 courses spread over 8 semesters — enough to exercise the infinite
 * scroll / pagination on the Courses screen.
 */
const COURSE_SEED: {
  code: string;
  name: string;
  credits: number;
  type: CurriculumCourse["type"];
  semester: number;
  completed: boolean;
}[] = [
  // Semester 1
  { code: "PRM201", name: "Programming Fundamentals",       credits: 4, type: "CORE",      semester: 1, completed: true },
  { code: "MTH101", name: "Mathematics for Computing",       credits: 3, type: "CORE",      semester: 1, completed: true },
  { code: "ENG101", name: "English 1",                       credits: 3, type: "CORE",      semester: 1, completed: true },
  { code: "PHY101", name: "Physics 1",                       credits: 3, type: "CORE",      semester: 1, completed: true },
  { code: "SEM101", name: "Seminar 1",                       credits: 1, type: "CORE",      semester: 1, completed: true },
  { code: "GD101",  name: "Game Design Fundamentals",        credits: 3, type: "ELECTIVE",  semester: 1, completed: false },

  // Semester 2
  { code: "DBI202", name: "Database Systems",                credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "OSG202", name: "Operating Systems",               credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "DSA203", name: "Data Structures & Algorithms",    credits: 4, type: "CORE",      semester: 2, completed: true },
  { code: "MTH201", name: "Discrete Mathematics",            credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "SWP202", name: "Software Engineering Process",    credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "IMG202", name: "Digital Image Processing",        credits: 3, type: "ELECTIVE",  semester: 2, completed: false },

  // Semester 3
  { code: "WED301", name: "Web Application Development",     credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "CNM301", name: "Computer Networks",               credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "ITC301", name: "Introduction to Computers",       credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "STT301", name: "Statistics for Data Science",     credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "HCI302", name: "Human-Computer Interaction",      credits: 3, type: "ELECTIVE",  semester: 3, completed: false },
  { code: "PRJ301", name: "Software Project 1",              credits: 2, type: "PRACTICUM", semester: 3, completed: true },

  // Semester 4
  { code: "AIA301", name: "Artificial Intelligence",         credits: 3, type: "CORE",      semester: 4, completed: true },
  { code: "SRE301", name: "Software Engineering",            credits: 4, type: "CORE",      semester: 4, completed: true },
  { code: "MOB302", name: "Mobile Application Development",  credits: 3, type: "CORE",      semester: 4, completed: true },
  { code: "NWE302", name: "Network Programming",             credits: 3, type: "ELECTIVE",  semester: 4, completed: false },
  { code: "DBT302", name: "Big Data Technologies",           credits: 3, type: "ELECTIVE",  semester: 4, completed: false },
  { code: "SEM401", name: "Seminar 2",                       credits: 1, type: "CORE",      semester: 4, completed: true },

  // Semester 5
  { code: "MLO302", name: "Machine Learning Operations",     credits: 3, type: "ELECTIVE",  semester: 5, completed: false },
  { code: "MLD401", name: "Machine Learning",                credits: 3, type: "CORE",      semester: 5, completed: false },
  { code: "DLP401", name: "Deep Learning",                   credits: 3, type: "ELECTIVE",  semester: 5, completed: false },
  { code: "CLD402", name: "Cloud Computing Fundamentals",    credits: 3, type: "CORE",      semester: 5, completed: false },
  { code: "ITC401", name: "Introduction to Cryptography",    credits: 3, type: "CORE",      semester: 5, completed: false },
  { code: "PRJ402", name: "Software Project 2",              credits: 2, type: "PRACTICUM", semester: 5, completed: false },

  // Semester 6
  { code: "NLP501", name: "Natural Language Processing",     credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "CV501",  name: "Computer Vision",                 credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "SWT501", name: "Software Testing",                credits: 3, type: "CORE",      semester: 6, completed: false },
  { code: "MGT502", name: "Software Project Management",     credits: 3, type: "CORE",      semester: 6, completed: false },
  { code: "DVP502", name: "DevOps Practices",                credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "IOT502", name: "Internet of Things",              credits: 3, type: "ELECTIVE",  semester: 6, completed: false },

  // Semester 7
  { code: "CAP401", name: "Capstone Project I",              credits: 4, type: "PROJECT",   semester: 7, completed: false },
  { code: "SDA601", name: "Software Design & Architecture",  credits: 3, type: "CORE",      semester: 7, completed: false },
  { code: "IS601",  name: "Information Systems",             credits: 3, type: "CORE",      semester: 7, completed: false },
  { code: "KBA601", name: "Knowledge-based AI",              credits: 3, type: "ELECTIVE",  semester: 7, completed: false },
  { code: "BIS602", name: "Business Intelligence Systems",   credits: 3, type: "ELECTIVE",  semester: 7, completed: false },
  { code: "PRJ601", name: "Practical Training 1",            credits: 2, type: "PRACTICUM", semester: 7, completed: false },

  // Semester 8
  { code: "CAP402", name: "Capstone Project II",             credits: 4, type: "PROJECT",   semester: 8, completed: false },
  { code: "RSH602", name: "Research Methodology",            credits: 3, type: "CORE",      semester: 8, completed: false },
  { code: "EMG603", name: "Engineering Ethics & Management", credits: 3, type: "CORE",      semester: 8, completed: false },
  { code: "FIN603", name: "Enterprise Systems",              credits: 3, type: "ELECTIVE",  semester: 8, completed: false },
  { code: "PRJ602", name: "Practical Training 2",            credits: 2, type: "PRACTICUM", semester: 8, completed: false },
  { code: "GRD701", name: "Graduation Project",              credits: 3, type: "PROJECT",   semester: 8, completed: false },
  { code: "SEM801", name: "Seminar 3",                       credits: 1, type: "CORE",      semester: 8, completed: false },
  { code: "ENT803", name: "Entrepreneurship for Engineers",   credits: 3, type: "ELECTIVE",  semester: 8, completed: false },
];

/** Longer descriptions for the course catalog (search screen). */
const COURSE_DESCRIPTIONS: Record<string, { description: string; objectives: string; learning_outcomes: string }> = {
  PRM201: {
    description: "Cú pháp, kiểm soát luồng, hàm, cấu trúc dữ liệu cơ bản và lập trình hướng đối tượng trong Python.",
    objectives: "Viết được chương trình console giải quyết bài toán trung bình; phân tích và giải thích mã nguồn của nhóm.",
    learning_outcomes: "Sinh viên nắm được nền tảng lập trình và tư duy thuật toán cơ bản.",
  },
  DBI202: {
    description: "Mô hình quan hệ, ngôn ngữ SQL, chuẩn hoá, chỉ mục, transaction và giới thiệu NoSQL.",
    objectives: "Thiết kế và truy vấn được cơ sở dữ liệu quan hệ cho bài toán thực tế.",
    learning_outcomes: "Sinh viên có khả năng thiết kế lược đồ CSDL và tối ưu truy vấn cơ bản.",
  },
  OSG202: {
    description: "Quản lý tiến trình, bộ nhớ, đồng bộ, lập lịch CPU và hệ thống file.",
    objectives: "Giải thích được cơ chế scheduling và đồng bộ hoạt động của hệ điều hành.",
    learning_outcomes: "Sinh viên hiểu rõ nguyên lý hoạt động của OS và biết lập luận về hiệu năng.",
  },
  DSA203: {
    description: "Mảng, linked list, stack, queue, cây, đồ thị, thuật toán sắp xếp và tìm kiếm.",
    objectives: "Phân tích độ phức tạp và chọn cấu trúc dữ liệu phù hợp cho bài toán.",
    learning_outcomes: "Sinh viên có nền tảng về cấu trúc dữ liệu và giải thuật cơ bản.",
  },
  MLD401: {
    description: "Học có giám sát, không giám sát, đánh giá mô hình, overfitting và tinh chỉnh tham số.",
    objectives: "Huấn luyện và đánh giá được mô hình ML trên tập dữ liệu thực tế.",
    learning_outcomes: "Sinh viên hiểu và áp dụng được các thuật toán ML phổ biến.",
  },
  DLP401: {
    description: "Mạng nơ-ron, CNN, RNN/Transformer, huấn luyện và transfer learning.",
    objectives: "Xây dựng và huấn luyện được mô hình deep learning cho bài toán phân loại.",
    learning_outcomes: "Sinh viên có khả năng chọn kiến trúc mạng và chỉnh huấn luyện.",
  },
  CLD402: {
    description: "IaaS/PaaS/SaaS, container, orchestration, serverless và kiến trúc microservices.",
    objectives: "Thiết kế hạ tầng cloud cho một dịch vụ web quy mô vừa.",
    learning_outcomes: "Sinh viên hiểu và triển khai được dịch vụ trên nền tảng đám mây.",
  },
  CAP401: {
    description: "Dự án capstone kỳ 1: phân tích yêu cầu, thiết kế kiến trúc và xây dựng MVP.",
    objectives: "Hoàn thành được một sản phẩm phần mềm hoàn chỉnh theo nhóm.",
    learning_outcomes: "Sinh viên tích lũy kinh nghiệm làm việc nhóm và quản lý dự án.",
  },
  CAP402: {
    description: "Dự án capstone kỳ 2: hoàn thiện, kiểm thử, triển khai và bảo vệ sản phẩm.",
    objectives: "Hoàn thiện sản phẩm và trình bày trước hội đồng.",
    learning_outcomes: "Sinh viên có khả năng tự quản lý toàn bộ vòng đời sản phẩm.",
  },
};

/**
 * Build the curriculum course list. Prerequisite ids are derived from the
 * seed order (a course depends on earlier courses of the same category).
 */
function buildCurriculumCourses(): CurriculumCourse[] {
  const courses: CurriculumCourse[] = [];

  COURSE_SEED.forEach((seed, idx) => {
    const id = `c${idx + 1}`;

    // Prereqs: for CORE/PROJECT courses, link to the previous 1–2 CORE
    // courses that come earlier in the seed list.
    const prerequisites: string[] = [];
    if (seed.type === "CORE" || seed.type === "PROJECT") {
      const earlierCores = courses.filter(
        (c) => (c.type === "CORE" || c.type === "PROJECT") && c.semester < seed.semester,
      );
      const take = earlierCores.slice(-2);
      prerequisites.push(...take.map((c) => c.id));
    } else if (seed.type === "ELECTIVE") {
      const earlierCore = courses.find(
        (c) => c.type === "CORE" && c.semester < seed.semester,
      );
      if (earlierCore) prerequisites.push(earlierCore.id);
    }

    courses.push({
      id,
      curriculum_version_id: "cv-se-k19",
      course_code: seed.code,
      name: seed.name,
      credits: seed.credits,
      type: seed.type,
      semester: seed.semester,
      prerequisites,
      completed: seed.completed,
    });
  });

  return courses;
}

export const mockCurriculumCourses: CurriculumCourse[] = buildCurriculumCourses();

/** Map of course code → rich description, used by the course detail sheet. */
export const mockCourseDetails = COURSE_DESCRIPTIONS;

/** Lookup helper: find a curriculum course by its code (e.g. "PRM201"). */
export function findCourseByCode(code: string): CurriculumCourse | undefined {
  return mockCurriculumCourses.find((c) => c.course_code === code);
}

// ── Conversations & messages ────────────────────────────────────────────────

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

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    student_id: "u-student-duc",
    advisor_id: "u-advisor-1",
    subject: "Kế hoạch học tập HK2 2026",
    last_message_at: "2026-10-18T14:30:00Z",
    unread_count: 2,
    status: "active",
  },
  {
    id: "conv-2",
    student_id: "u-student-duc",
    advisor_id: "u-advisor-1",
    subject: "Chọn chuyên ngành AI hay Cloud?",
    last_message_at: "2026-10-15T09:00:00Z",
    unread_count: 0,
    status: "active",
  },
  {
    id: "conv-3",
    student_id: "u-student-1",
    advisor_id: "u-advisor-1",
    subject: "Đăng ký môn điện tử cho kỳ tới",
    last_message_at: "2026-10-17T11:20:00Z",
    unread_count: 1,
    status: "active",
  },
  {
    id: "conv-4",
    student_id: "u-student-4",
    advisor_id: "u-advisor-2",
    subject: "Lộ trình học Data Science",
    last_message_at: "2026-10-19T08:45:00Z",
    unread_count: 3,
    status: "active",
  },
  {
    id: "conv-5",
    student_id: "u-student-2",
    advisor_id: "u-advisor-1",
    subject: "Học phần môn tiên quyết bị thiếu",
    last_message_at: "2026-10-12T16:05:00Z",
    unread_count: 0,
    status: "active",
  },
  {
    id: "conv-6",
    student_id: "u-student-duc",
    advisor_id: "u-advisor-1",
    subject: "Nộp báo cáo giữa kỳ capstone",
    last_message_at: "2026-10-08T10:00:00Z",
    unread_count: 0,
    status: "archived",
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
  {
    id: "msg-4",
    conversation_id: "conv-2",
    role: "student",
    content: "Em nên chọn AI hay Cloud để đi theo lâu dài ạ?",
    sent_at: "2026-10-15T08:40:00Z",
    read_at: "2026-10-15T08:55:00Z",
  },
  {
    id: "msg-5",
    conversation_id: "conv-2",
    role: "advisor",
    content: "Tùy hướng đi làm sau graduation em, cả hai đều mở rộng. Hãy chọn cái em thấy hứng thú nhất.",
    sent_at: "2026-10-15T09:00:00Z",
    read_at: "2026-10-15T09:10:00Z",
  },
  {
    id: "msg-6",
    conversation_id: "conv-3",
    role: "student",
    content: "Kỳ tới em có thể đăng ký thêm môn điện tử không thầy?",
    sent_at: "2026-10-17T11:00:00Z",
    read_at: "2026-10-17T11:05:00Z",
  },
  {
    id: "msg-7",
    conversation_id: "conv-3",
    role: "advisor",
    content: "Được, miễn là em không vượt quá 18 tín chỉ.",
    sent_at: "2026-10-17T11:20:00Z",
    read_at: null,
  },
  {
    id: "msg-8",
    conversation_id: "conv-4",
    role: "advisor",
    content: "Chào em, mình cùng tra lộ trình Data Science nhé.",
    sent_at: "2026-10-19T08:45:00Z",
    read_at: null,
  },
  {
    id: "msg-9",
    conversation_id: "conv-5",
    role: "student",
    content: "Em đã hoàn thành môn tiên quyết rồi ạ, hồ sơ chưa cập nhật.",
    sent_at: "2026-10-12T15:50:00Z",
    read_at: "2026-10-12T16:05:00Z",
  },
];

// ── Notifications ────────────────────────────────────────────────────────────

export type { AppNotification, NotificationKind } from "@/types";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** 20 notifications spread across kinds + students, for the list screen. */
export const mockNotifications: AppNotification[] = [
  {
    id: "n-1",
    user_id: "u-student-duc",
    kind: "ADVISOR",
    title: "Tin nhắn mới từ advisor",
    body: "Thầy Thông đã trả lời câu hỏi về kế hoạch học tập.",
    created_at: new Date(Date.now() - 12 * MIN).toISOString(),
    read_at: null,
    href: "/(app)/messages/conv-1",
  },
  {
    id: "n-2",
    user_id: "u-student-duc",
    kind: "PLAN",
    title: "Kế hoạch học tập đã được cập nhật",
    body: "AI đã sinh lại kế hoạch dựa trên GPA mới nhất của bạn.",
    created_at: new Date(Date.now() - 3 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/plan",
  },
  {
    id: "n-3",
    user_id: "u-student-duc",
    kind: "SYSTEM",
    title: "Chào mừng đến với FAAPS!",
    body: "Bắt đầu khám phá các tính năng của FAAPS Mobile.",
    created_at: new Date(Date.now() - DAY).toISOString(),
    read_at: new Date(Date.now() - 23 * HOUR).toISOString(),
  },
  {
    id: "n-4",
    user_id: "u-student-duc",
    kind: "GRADE",
    title: "Điểm giữa kỳ đã được cập nhật",
    body: "Bạn có điểm mới ở 4 môn học. Xem điểm trong hồ sơ.",
    created_at: new Date(Date.now() - 2 * DAY).toISOString(),
    read_at: null,
    href: "/(app)/profile",
  },
  {
    id: "n-5",
    user_id: "u-student-duc",
    kind: "PLAN",
    title: "Nhắc nhở: hạn chọn môn sắp tới",
    body: "Hạn đăng ký môn học kỳ Spring 2027 còn 5 ngày.",
    created_at: new Date(Date.now() - 3 * DAY).toISOString(),
    read_at: null,
    href: "/(app)/plan",
  },
  {
    id: "n-6",
    user_id: "u-student-duc",
    kind: "ADVISOR",
    title: "Advisor đã gửi tài liệu tham khảo",
    body: "Thầy Thông gửi link tài liệu ôn tập môn Machine Learning.",
    created_at: new Date(Date.now() - 4 * DAY).toISOString(),
    read_at: new Date(Date.now() - 3 * DAY).toISOString(),
  },
  {
    id: "n-7",
    user_id: "u-student-duc",
    kind: "SYSTEM",
    title: "Cập nhật ứng dụng",
    body: "Phiên bản 1.1.0 đã có tính năng xem chương trình khung.",
    created_at: new Date(Date.now() - 5 * DAY).toISOString(),
    read_at: new Date(Date.now() - 5 * DAY).toISOString(),
  },
  {
    id: "n-8",
    user_id: "u-student-duc",
    kind: "GRADE",
    title: "GPA kỳ vừa rồi: 7.42",
    body: "GPA của bạn đã tăng 0.18 so với kỳ trước.",
    created_at: new Date(Date.now() - 6 * DAY).toISOString(),
    read_at: new Date(Date.now() - 6 * DAY).toISOString(),
  },
  {
    id: "n-9",
    user_id: "u-student-duc",
    kind: "PLAN",
    title: "Lộ trình chuyên ngành AI đã sẵn sàng",
    body: "Chọn chuyên ngành để AI tư vấn chính xác hơn.",
    created_at: new Date(Date.now() - 7 * DAY).toISOString(),
    read_at: null,
    href: "/(app)/profile",
  },
  {
    id: "n-10",
    user_id: "u-student-duc",
    kind: "ADVISOR",
    title: "Lời nhắc gặp mặt định kỳ",
    body: "Buổi gặp mặt advisor định kỳ vào 14:00 thứ Năm tuần sau.",
    created_at: new Date(Date.now() - 8 * DAY).toISOString(),
    read_at: new Date(Date.now() - 8 * DAY).toISOString(),
  },
  {
    id: "n-11",
    user_id: "u-student-1",
    kind: "ADVISOR",
    title: "Tin nhắn mới từ advisor",
    body: "Thầy Thông đã trả lời về việc đăng ký môn điện tử.",
    created_at: new Date(Date.now() - 40 * MIN).toISOString(),
    read_at: null,
    href: "/(app)/messages/conv-3",
  },
  {
    id: "n-12",
    user_id: "u-student-1",
    kind: "PLAN",
    title: "Kế hoạch học tập đã được cập nhật",
    body: "AI đã sinh lại kế hoạch dựa trên GPA mới nhất của bạn.",
    created_at: new Date(Date.now() - 5 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/plan",
  },
  {
    id: "n-13",
    user_id: "u-student-1",
    kind: "GRADE",
    title: "Điểm giữa kỳ đã được cập nhật",
    body: "Bạn có điểm mới ở 3 môn học.",
    created_at: new Date(Date.now() - 2 * DAY).toISOString(),
    read_at: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "n-14",
    user_id: "u-student-1",
    kind: "SYSTEM",
    title: "Chào mừng đến với FAAPS!",
    body: "Bắt đầu khám phá các tính năng của FAAPS Mobile.",
    created_at: new Date(Date.now() - 3 * DAY).toISOString(),
    read_at: new Date(Date.now() - 3 * DAY).toISOString(),
  },
  {
    id: "n-15",
    user_id: "u-student-1",
    kind: "SYSTEM",
    title: "Cập nhật ứng dụng",
    body: "Phiên bản 1.1.0 đã có tính năng xem chương trình khung.",
    created_at: new Date(Date.now() - 4 * DAY).toISOString(),
    read_at: new Date(Date.now() - 4 * DAY).toISOString(),
  },
  {
    id: "n-16",
    user_id: "u-student-2",
    kind: "ADVISOR",
    title: "Tin nhắn mới từ advisor",
    body: "Thầy Thông đã phản hồi về học phần môn tiên quyết.",
    created_at: new Date(Date.now() - 2 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/messages/conv-5",
  },
  {
    id: "n-17",
    user_id: "u-student-2",
    kind: "GRADE",
    title: "Điểm giữa kỳ đã được cập nhật",
    body: "Bạn có điểm mới ở 5 môn học.",
    created_at: new Date(Date.now() - 3 * DAY).toISOString(),
    read_at: null,
    href: "/(app)/profile",
  },
  {
    id: "n-18",
    user_id: "u-student-4",
    kind: "ADVISOR",
    title: "Tin nhắn mới từ advisor",
    body: "Cô Linh đã gửi lộ trình học Data Science.",
    created_at: new Date(Date.now() - 30 * MIN).toISOString(),
    read_at: null,
    href: "/(app)/messages/conv-4",
  },
  {
    id: "n-19",
    user_id: "u-student-4",
    kind: "PLAN",
    title: "Nhắc nhở: hạn chọn môn sắp tới",
    body: "Hạn đăng ký môn học kỳ Spring 2027 còn 7 ngày.",
    created_at: new Date(Date.now() - 9 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/plan",
  },
  {
    id: "n-20",
    user_id: "u-student-4",
    kind: "SYSTEM",
    title: "Chào mừng đến với FAAPS!",
    body: "Bắt đầu khám phá các tính năng của FAAPS Mobile.",
    created_at: new Date(Date.now() - 2 * DAY).toISOString(),
    read_at: new Date(Date.now() - 2 * DAY).toISOString(),
  },
];
