/**
 * Course domain types (mirrors DB `courses` + `course_prerequisites` tables).
 */

// ── Course types ──────────────────────────────────────────────────────────────

export type CourseCategory =
  | "FUNDAMENTAL"
  | "CORE"
  | "ELECTIVE"
  | "PRACTICUM"
  | "PROJECT"
  | "OTHER";

export interface Course {
  id: string;
  /** Unique course code, e.g. "PRM201" */
  code: string;
  name: string;
  credits: number;
  category: CourseCategory;
  /** Short description / syllabus summary */
  description?: string | null;
  /** Learning objectives */
  objectives?: string | null;
  /** Expected learning outcomes */
  learning_outcomes?: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

// ── Prerequisite types ────────────────────────────────────────────────────────

export type PrerequisiteType = "PREREQUISITE" | "CO_REQUISITE";

/**
 * A prerequisite rule for a course.
 * - Rows with the same `group_no` are **alternatives** (OR).
 * - Rows with different `group_no` are **all required** (AND).
 *
 * Example: `(A OR B) AND C` → A:group=1, B:group=1, C:group=2
 */
export interface CoursePrerequisite {
  id: string;
  course_id: string;
  prerequisite_course: Course;
  /** Group number for OR/AND logic */
  group_no: number;
  type: PrerequisiteType;
  /** Minimum score (10-point scale) to satisfy, e.g. 5.00 */
  minimum_score?: number | null;
}

// ── Course with full detail ───────────────────────────────────────────────────

export interface CourseDetail extends Course {
  prerequisites: CoursePrerequisite[];
  /** Courses that have this course as a prerequisite (reverse lookup) */
  required_by: Pick<Course, "id" | "code" | "name">[];
  /** Courses to be taken in the same semester */
  co_requisites: Course[];
}

// ── API response types ────────────────────────────────────────────────────────

export interface CoursesSearchParams {
  q?: string;
  category?: CourseCategory;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  page_size?: number;
}

export interface PaginatedCourses {
  data: Course[];
  total: number;
  page: number;
  page_size: number;
}
