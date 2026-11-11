/**
 * Course domain types — mirrors the backend `courses` / `course_prerequisites`
 * tables and the `StudentAcademicService` records.
 */

/** `StudentAcademicService.Course` */
export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  /** The category *name* from `course_categories`, e.g. "Core Courses". */
  category: string;
  description: string | null;
  objectives: string | null;
  learningOutcomes: string | null;
}

/** `StudentAcademicService.Prerequisite` */
export interface CoursePrerequisite {
  id: string;
  courseCode: string;
  courseName: string;
  /** Group number: same group = alternatives (OR), different groups = all required (AND). */
  groupNo: number;
  type: "PREREQUISITE" | "CO_REQUISITE" | string;
  minimumScore: number | null;
}

/** `StudentAcademicController.CourseDetail` */
export interface CourseDetail {
  course: Course;
  prerequisites: CoursePrerequisite[];
}

/** `StudentAcademicController` — `GET /api/student/courses` is a flat list. */
export interface CourseSearchParams {
  search?: string;
  page?: number;
  size?: number;
}
