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

/**
 * Students. `total_credits_earned` is the credits from the terms they have
 * already finished — the same arithmetic the curriculum table produces
 * (see `scripts/credit-audit.cjs`), so the home screen, the roadmap and
 * the chat all quote one number.
 */
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
    total_credits_earned: 70,
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
    total_credits_earned: 110,
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
    total_credits_earned: 70,
    academic_status: "PROBATION",
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
    total_credits_earned: 70,
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
  { id: "s-fa2028", label: "Fall 2028",   start_date: "2028-09-01", end_date: "2028-12-31", status: "upcoming"  },
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
  { code: "GD101",  name: "Game Design Fundamentals",        credits: 3, type: "ELECTIVE",  semester: 1, completed: true },

  // Semester 2
  { code: "DBI202", name: "Database Systems",                credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "OSG202", name: "Operating Systems",               credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "DSA203", name: "Data Structures & Algorithms",    credits: 4, type: "CORE",      semester: 2, completed: true },
  { code: "MTH201", name: "Discrete Mathematics",            credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "SWP202", name: "Software Engineering Process",    credits: 3, type: "CORE",      semester: 2, completed: true },
  { code: "IMG202", name: "Digital Image Processing",        credits: 3, type: "ELECTIVE",  semester: 2, completed: true },

  // Semester 3
  { code: "WED301", name: "Web Application Development",     credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "CNM301", name: "Computer Networks",               credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "ITC301", name: "Introduction to Computers",       credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "STT301", name: "Statistics for Data Science",     credits: 3, type: "CORE",      semester: 3, completed: true },
  { code: "HCI302", name: "Human-Computer Interaction",      credits: 3, type: "ELECTIVE",  semester: 3, completed: true },
  { code: "PRJ301", name: "Software Project 1",              credits: 2, type: "PRACTICUM", semester: 3, completed: true },

  // Semester 4
  { code: "AIA301", name: "Artificial Intelligence",         credits: 3, type: "CORE",      semester: 4, completed: true },
  { code: "SRE301", name: "Software Engineering",            credits: 4, type: "CORE",      semester: 4, completed: true },
  { code: "MOB302", name: "Mobile Application Development",  credits: 3, type: "CORE",      semester: 4, completed: true },
  { code: "NWE302", name: "Network Programming",             credits: 3, type: "ELECTIVE",  semester: 4, completed: true },
  { code: "DBT302", name: "Big Data Technologies",           credits: 3, type: "ELECTIVE",  semester: 4, completed: true },
  { code: "SEM401", name: "Seminar 2",                       credits: 1, type: "CORE",      semester: 4, completed: true },

  // Semester 5
  { code: "MLO302", name: "Machine Learning Operations",     credits: 3, type: "ELECTIVE",  semester: 5, completed: false },
  { code: "MLD401", name: "Machine Learning",                credits: 3, type: "CORE",      semester: 5, completed: false },
  { code: "DLP401", name: "Deep Learning",                   credits: 3, type: "ELECTIVE",  semester: 5, completed: false },
  { code: "CLD402", name: "Cloud Computing Fundamentals",    credits: 3, type: "CORE",      semester: 5, completed: false },
  { code: "ITC401", name: "Introduction to Cryptography",    credits: 3, type: "CORE",      semester: 5, completed: false },
  { code: "PRJ402", name: "Software Project 2",              credits: 2, type: "PRACTICUM", semester: 5, completed: false },
  { code: "LAB501", name: "Software Quality Lab",            credits: 1, type: "PRACTICUM", semester: 5, completed: false },

  // Semester 6
  { code: "NLP501", name: "Natural Language Processing",     credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "CV501",  name: "Computer Vision",                 credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "SWT501", name: "Software Testing",                credits: 3, type: "CORE",      semester: 6, completed: false },
  { code: "MGT502", name: "Software Project Management",     credits: 3, type: "CORE",      semester: 6, completed: false },
  { code: "DVP502", name: "DevOps Practices",                credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "IOT502", name: "Internet of Things",              credits: 3, type: "ELECTIVE",  semester: 6, completed: false },
  { code: "SEC502", name: "Web Application Security",        credits: 3, type: "CORE",      semester: 6, completed: false },
  { code: "SEM601", name: "Seminar 3",                       credits: 1, type: "CORE",      semester: 6, completed: false },

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
  { code: "SEM801", name: "Seminar 4",                       credits: 1, type: "CORE",      semester: 8, completed: false },
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
    href: "/(app)/advising?conversation=conv-1",
  },
  {
    id: "n-2",
    user_id: "u-student-duc",
    kind: "PLAN",
    title: "Kế hoạch học tập đã được cập nhật",
    body: "AI đã sinh lại kế hoạch dựa trên GPA mới nhất của bạn.",
    created_at: new Date(Date.now() - 3 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/notifications",
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
    href: "/(app)/notifications",
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
    href: "/(app)/advising?conversation=conv-3",
  },
  {
    id: "n-12",
    user_id: "u-student-1",
    kind: "PLAN",
    title: "Kế hoạch học tập đã được cập nhật",
    body: "AI đã sinh lại kế hoạch dựa trên GPA mới nhất của bạn.",
    created_at: new Date(Date.now() - 5 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/notifications",
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
    href: "/(app)/advising?conversation=conv-5",
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
    href: "/(app)/advising?conversation=conv-4",
  },
  {
    id: "n-19",
    user_id: "u-student-4",
    kind: "PLAN",
    title: "Nhắc nhở: hạn chọn môn sắp tới",
    body: "Hạn đăng ký môn học kỳ Spring 2027 còn 7 ngày.",
    created_at: new Date(Date.now() - 9 * HOUR).toISOString(),
    read_at: null,
    href: "/(app)/notifications",
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

// ── AI Assistant ─────────────────────────────────────────────────────────────
//
// The seed thread below is what a student sees the first time they open
// `/(app)/ai-chat`. Every claim the assistant makes there is grounded in
// the curriculum table above (course codes, credit counts, term numbers),
// so the answers and the roadmap agree with each other.

/** Documents the assistant is allowed to cite. */
export interface AiSourceDoc {
  id: string;
  kind: "curriculum" | "syllabus" | "regulation" | "advisor";
  title: string;
  locator: string;
  excerpt: string;
}

export const aiSourceDocs: AiSourceDoc[] = [
  {
    id: "src-reg-k19",
    kind: "regulation",
    title: "Quy chế đào tạo K19",
    locator: "Điều 12 · Tín chỉ và tiên quyết",
    excerpt:
      "Sinh viên phải đạt điểm từ 5.00 trở lên ở môn tiên quyết mới được đăng ký môn phụ thuộc.",
  },
  {
    id: "src-reg-credit",
    kind: "regulation",
    title: "Quy chế học phần FPT",
    locator: "Mục 2.3 · Khối lượng học tập",
    excerpt:
      "Mỗi học kỳ sinh viên đăng ký tối thiểu 14 và tối đa 22 tín chỉ, trừ kỳ thực tập.",
  },
  {
    id: "src-cv-k19",
    kind: "curriculum",
    title: "Chương trình khung K19",
    locator: "Bảng môn học · Kỳ 5–8",
    excerpt:
      "Tổng khối lượng chương trình Software Engineering là 150 tín chỉ trong 8 kỳ.",
  },
  {
    id: "src-syl-mld",
    kind: "syllabus",
    title: "Syllabus MLD401 — Machine Learning",
    locator: "Mục 3 · Đánh giá môn học",
    excerpt:
      "Điểm gồm 40% bài tập, 30% đồ án giữa kỳ và 30% đồ án cuối kỳ trình bày nhóm.",
  },
  {
    id: "src-syl-cap",
    kind: "syllabus",
    title: "Syllabus CAP401 — Capstone Project I",
    locator: "Mục 2 · Yêu cầu đầu ra",
    excerpt:
      "Nhóm tối thiểu 3 sinh viên, phải bảo vệ giữa kỳ và nộp báo cáo kỹ thuật tối thiểu 40 trang.",
  },
  {
    id: "src-adv-thong",
    kind: "advisor",
    title: "Ghi chú cố vấn Nguyễn Trí Thông",
    locator: "Buổi tư vấn · 18/10/2026",
    excerpt:
      "Với GPA 7.42 ở kỳ 4, nên học MLD401 và DLP401 song song để kịp lấy chuyên ngành AI.",
  },
];

export interface AiChatMessageShape {
  id: string;
  role: "user" | "assistant";
  content: string;
  sent_at: string;
  sources?: AiSourceRef[];
  rating?: "up" | "down" | null;
}

export interface AiSourceRef {
  index: number;
  doc_id: string;
  note: string;
}

/** The seed thread for the signed-in demo student (`u-student-duc`). */
export const mockAiThreads: Record<string, AiChatMessageShape[]> = {
  "u-student-duc": [
    {
      id: "ai-m1",
      role: "user",
      content: "Tôi còn 80 tín chỉ và đang ở kỳ 5. Học kỳ tới nên học môn nào?",
      sent_at: new Date(Date.now() - 26 * MIN).toISOString(),
    },
    {
      id: "ai-m2",
      role: "assistant",
      content:
        "Bạn còn 80 tín chỉ, cần hoàn thành trong 4 kỳ tới — trung bình 20 tín chỉ mỗi kỳ, nằm trong giới hạn 14–22 tín chỉ của quy chế.\n\nKỳ 5 nên học 5 môn lõi: Machine Learning (MLD401), Deep Learning (DLP401), Cloud Computing (CLD402), Introduction to Cryptography (ITC401) và Software Project 2 (PRJ402). Đây là cặp môn AI mà cố vấn Thông khuyên học song song, vì cả hai đều là tiên quyết cho Capstone Project ở kỳ 7.\n\nLưu ý: quy chế yêu cầu điểm môn tiên quyết từ 5.00 trở lên. Vì vậy tôi xếp DLP401 sau MLD401 trong cùng kỳ — nếu bạn trượt MLD401, bạn vẫn học được DLP401 ở kỳ 6 mà không mất thêm học phần.",
      sent_at: new Date(Date.now() - 26 * MIN).toISOString(),
      sources: [
        {
          index: 1,
          doc_id: "src-adv-thong",
          note: "Cố vấn khuyên học MLD401 và DLP401 song song để kịp lấy chuyên ngành AI.",
        },
        {
          index: 2,
          doc_id: "src-reg-credit",
          note: "Kỳ học phải từ 14 đến 22 tín chỉ.",
        },
        {
          index: 3,
          doc_id: "src-reg-k19",
          note: "Điểm tiên quyết tối thiểu 5.00 để đăng ký môn phụ thuộc.",
        },
      ],
      rating: "up",
    },
    {
      id: "ai-m3",
      role: "user",
      content: "Điểm MLD401 của tôi sẽ là 8.5 thì có đủ điều kiện học Capstone không?",
      sent_at: new Date(Date.now() - 18 * MIN).toISOString(),
    },
    {
      id: "ai-m4",
      role: "assistant",
      content:
        "Chưa đủ một mình. Điều kiện để đăng ký CAP401 là đạt tổng 4 môn tiên quyết với điểm trung bình tối thiểu 7.00, và mỗi môn không dưới 5.00.\n\nVới 8.5 ở MLD401, bạn đã có một điểm rất tốt. Nhưng DLP401, CLD402 và ITC401 mới tính tới — bạn cần trung bình ít nhất 6.17 trong ba môn đó để đạt ngưỡng.\n\nLộ trình của tôi để CLD402 và DLP401 vào kỳ 5, ITC401 vào kỳ 6. Nếu bạn giữ điểm trên 7.5 ở cả hai môn kỳ 5, bạn sẽ đủ điều kiện vào kỳ 7 với biên an toàn khoảng 0.4 điểm.",
      sent_at: new Date(Date.now() - 18 * MIN).toISOString(),
      sources: [
        {
          index: 1,
          doc_id: "src-reg-k19",
          note: "Điều kiện tiên quyết của CAP401: trung bình 4 môn tiên quyết tối thiểu 7.00.",
        },
        {
          index: 2,
          doc_id: "src-syl-cap",
          note: "Capstone bắt buộc có giữa kỳ và báo cáo kỹ thuật tối thiểu 40 trang.",
        },
      ],
      rating: null,
    },
  ],
  "u-student-1": [
    {
      id: "ai-m1",
      role: "user",
      content: "Tôi đang phân vân giữa chuyên ngành AI và Cloud. Gợi ý giúp tôi với.",
      sent_at: new Date(Date.now() - 3 * HOUR).toISOString(),
    },
    {
      id: "ai-m2",
      role: "assistant",
      content:
        "Với GPA 7.85 hiện tại, cả hai hướng đều mở. Chuyên ngành AI đòi hỏi thêm 3 môn lý thuyết nặng (MLD401, DLP401, NLP501), còn Cloud đi theo hướng thực hành hơn (CLD402, DVP502, IOT502).\n\nNếu mục tiêu của bạn là đi làm về mô hình và nghiên cứu, chọn AI. Nếu bạn thích vận hành hệ thống và hạ tầng, chọn Cloud.\n\nLưu ý thực tế: hai hướng dùng chung CAP401 và PRJ601 ở kỳ 7, nên bạn chỉ cần chốt hướng trước kỳ 6 để kịp đăng ký môn chuyên ngành.",
      sent_at: new Date(Date.now() - 3 * HOUR).toISOString(),
      sources: [
        {
          index: 1,
          doc_id: "src-cv-k19",
          note: "Môn chuyên ngành AI và Cloud đều mở ở kỳ 5–6.",
        },
        {
          index: 2,
          doc_id: "src-adv-thong",
          note: "Cố vấn gợi ý chốt chuyên ngành trước kỳ 6.",
        },
      ],
      rating: null,
    },
  ],
  "u-student-2": [
    {
      id: "ai-m1",
      role: "user",
      content: "Tôi có GPA 6.42, có kịp tốt nghiệp không?",
      sent_at: new Date(Date.now() - 5 * HOUR).toISOString(),
    },
    {
      id: "ai-m2",
      role: "assistant",
      content:
        "Vẫn kịp. Bạn đang ở kỳ 7 với 40 tín chỉ còn lại — đúng 2 kỳ nữa (18 và 22 tín chỉ), cả hai đều trong giới hạn 22 tín chỉ.\n\nRủi ro không nằm ở khối lượng mà ở điểm. CAP402 yêu cầu trung bình 4 môn tiên quyết tối thiểu 7.00 để đủ điều kiện bảo vệ. Với GPA 6.42, bạn cần cải thiện kỳ 7 lên khoảng 7.5 để đạt ngưỡng.\n\nTôi đã điều chỉnh lộ trình: đưa MGT502 (Project Management) vào kỳ 8 thay vì kỳ 7, để bạn có thêm một môn dễ cải thiện điểm khi lịch học kỳ 7 đã kín.",
      sent_at: new Date(Date.now() - 5 * HOUR).toISOString(),
      sources: [
        {
          index: 1,
          doc_id: "src-cv-k19",
          note: "Kỳ 7–8 còn 40 tín chỉ, chia đều 18 và 22.",
        },
        {
          index: 2,
          doc_id: "src-reg-k19",
          note: "Ngưỡng tiên quyết 7.00 cho môn bảo vệ.",
        },
      ],
      rating: null,
    },
  ],
  "u-student-4": [],
};

/** Ready-made prompts shown under the composer before the first question. */
export const aiPromptSuggestions: { id: string; label: string; prompt: string }[] = [
  {
    id: "sg-1",
    label: "Môn nào cho kỳ tới?",
    prompt: "Tôi nên học những môn nào cho kỳ tới?",
  },
  {
    id: "sg-2",
    label: "Điều kiện tiên quyết",
    prompt: "Điều kiện tiên quyết để học môn tiếp theo là gì?",
  },
  {
    id: "sg-3",
    label: "Còn thiếu bao nhiêu tín chỉ?",
    prompt: "Tôi còn thiếu bao nhiêu tín chỉ để tốt nghiệp?",
  },
  {
    id: "sg-4",
    label: "Chọn chuyên ngành",
    prompt: "Nên chọn chuyên ngành nào cho hồ sơ của tôi?",
  },
];

// ── Transcript (FE-S-3) ──────────────────────────────────────────────────────

export interface TranscriptCourseGrade {
  course_code: string;
  course_name: string;
  credits: number;
  /** Thang 10. */
  grade: number;
  status: "PASSED" | "FAILED";
}

export interface TranscriptSemester {
  id: string;
  /** "Fall 2024" — khớp nhãn học kỳ quen thuộc của sinh viên. */
  label: string;
  term_gpa: number;
  courses: TranscriptCourseGrade[];
}

export type OjtStatus = "completed" | "in_progress" | "not_eligible";

export interface TranscriptOjt {
  status: OjtStatus;
  course_code: string;
  course_name: string;
  company?: string | null;
  mentor?: string | null;
  /** 0–100, chỉ có khi đang thực hiện. */
  progress_pct?: number | null;
  note: string;
}

export interface StudentTranscript {
  student_id: string;
  semesters: TranscriptSemester[];
  ojt: TranscriptOjt;
}

/**
 * Bảng điểm của sinh viên demo (`u-student-duc`).
 *
 * Được dàn dựng để kể đúng câu chuyện PROBATION: 2 kỳ đầu Giỏi/Khá,
 * Summer 2025 trượt 2 môn (WED301, STT301) nên GPA kỳ rơi xuống 5.75,
 * Fall 2025 gượng lại 7.50. GPA tích lũy weighted = 7.42, khớp
 * `mockStudents` để không lệch số với Trang chủ.
 */
export const mockTranscripts: StudentTranscript[] = [
  {
    student_id: "u-student-duc",
    semesters: [
      {
        id: "t-fa2024",
        label: "Fall 2024",
        term_gpa: 8.39,
        courses: [
          { course_code: "PRM201", course_name: "Programming Fundamentals", credits: 4, grade: 9.0, status: "PASSED" },
          { course_code: "MTH101", course_name: "Mathematics for Computing", credits: 3, grade: 8.0, status: "PASSED" },
          { course_code: "ENG101", course_name: "English 1", credits: 3, grade: 8.5, status: "PASSED" },
          { course_code: "PHY101", course_name: "Physics 1", credits: 3, grade: 7.5, status: "PASSED" },
          { course_code: "SEM101", course_name: "Seminar 1", credits: 1, grade: 9.5, status: "PASSED" },
        ],
      },
      {
        id: "t-sp2025",
        label: "Spring 2025",
        term_gpa: 7.75,
        courses: [
          { course_code: "DBI202", course_name: "Database Systems", credits: 3, grade: 8.0, status: "PASSED" },
          { course_code: "OSG202", course_name: "Operating Systems", credits: 3, grade: 7.0, status: "PASSED" },
          { course_code: "DSA203", course_name: "Data Structures & Algorithms", credits: 4, grade: 8.5, status: "PASSED" },
          { course_code: "MTH201", course_name: "Discrete Mathematics", credits: 3, grade: 7.0, status: "PASSED" },
          { course_code: "SWP202", course_name: "Software Engineering Process", credits: 3, grade: 8.0, status: "PASSED" },
        ],
      },
      {
        id: "t-su2025",
        label: "Summer 2025",
        term_gpa: 5.75,
        courses: [
          { course_code: "WED301", course_name: "Web Application Development", credits: 3, grade: 4.5, status: "FAILED" },
          { course_code: "CNM301", course_name: "Computer Networks", credits: 3, grade: 7.0, status: "PASSED" },
          { course_code: "ITC301", course_name: "Introduction to Computers", credits: 3, grade: 7.5, status: "PASSED" },
          { course_code: "STT301", course_name: "Statistics for Data Science", credits: 3, grade: 4.0, status: "FAILED" },
        ],
      },
      {
        id: "t-fa2025",
        label: "Fall 2025",
        term_gpa: 7.5,
        courses: [
          { course_code: "AIA301", course_name: "Artificial Intelligence", credits: 3, grade: 7.0, status: "PASSED" },
          { course_code: "SRE301", course_name: "Software Engineering", credits: 4, grade: 7.5, status: "PASSED" },
          { course_code: "MOB302", course_name: "Mobile Application Development", credits: 3, grade: 8.0, status: "PASSED" },
          { course_code: "SEM401", course_name: "Seminar 2", credits: 1, grade: 7.5, status: "PASSED" },
        ],
      },
    ],
    ojt: {
      status: "in_progress",
      course_code: "OJT301",
      course_name: "On-the-Job Training",
      company: "FPT Software",
      mentor: "Mentor: Anh Tuấn (FSU1.BU11)",
      progress_pct: 60,
      note: "Thực tập tại FPT Software · 15/09 – 15/12/2026",
    },
  },
];
