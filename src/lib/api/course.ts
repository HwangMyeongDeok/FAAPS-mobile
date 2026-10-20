/**
 * Course service.
 *
 * Data flow:
 *   Screen → Query hook → Service function → mock API (or real API later)
 *
 * The service layer wraps the data-access functions and applies
 * any business logic, validation, or transformation.
 */

import type {
  Course,
  CourseDetail,
  CoursePrerequisite,
  CoursesSearchParams,
  PaginatedCourses,
  PrerequisiteType,
} from "@/types/course";
import { config } from "@/config/api";
import { request } from "@/lib/http";
import {
  mockCurriculumCourses,
  mockCurriculumVersions,
  mockSpecializations,
  type CurriculumCourse,
} from "@/lib/db/mockDb";

const NETWORK_DELAY_MS = 400;

// ── Mock helpers ─────────────────────────────────────────────────────────────

/** Convert our internal mock format to the Course type. */
function mockToCourse(mock: CurriculumCourse): Course {
  return {
    id: mock.id,
    code: mock.course_code,
    name: mock.name,
    credits: mock.credits,
    category: mockTypeToCategory(mock.type),
    description: null,
    objectives: null,
    learning_outcomes: null,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mockTypeToCategory(
  type: CurriculumCourse["type"]
): Course["category"] {
  switch (type) {
    case "CORE":      return "CORE";
    case "ELECTIVE":  return "ELECTIVE";
    case "PRACTICUM": return "PRACTICUM";
    case "PROJECT":   return "PROJECT";
    default:          return "OTHER";
  }
}

/** Build a full CourseDetail from a mock CurriculumCourse. */
function mockToDetail(mock: CurriculumCourse): CourseDetail {
  const course = mockToCourse(mock);

  // Resolve prerequisites
  const prerequisites: CoursePrerequisite[] = mock.prerequisites.map((pid, idx) => {
    const prereqMock = mockCurriculumCourses.find((c) => c.id === pid);
    return {
      id: `prereq-${mock.id}-${pid}`,
      course_id: mock.id,
      prerequisite_course: prereqMock ? mockToCourse(prereqMock) : {
        id: pid,
        code: pid,
        name: pid,
        credits: 0,
        category: "OTHER",
        status: "ACTIVE",
        created_at: "",
        updated_at: "",
      },
      group_no: 1,
      type: "PREREQUISITE" as PrerequisiteType,
      minimum_score: null,
    };
  });

  // Reverse: courses that require this one
  const requiredBy = mockCurriculumCourses
    .filter((c) => c.prerequisites.includes(mock.id))
    .map((c) => ({ id: c.id, code: c.course_code, name: c.name }));

  return {
    ...course,
    prerequisites,
    required_by: requiredBy,
    co_requisites: [],
  };
}

// ── API functions ────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Search/list courses with optional filters.
 */
export async function searchCourses(
  params: CoursesSearchParams = {}
): Promise<PaginatedCourses> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);

    const q = (params.q ?? "").toLowerCase().trim();
    let courses = mockCurriculumCourses.map(mockToCourse);

    // Filter by search query
    if (q) {
      courses = courses.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (params.category) {
      courses = courses.filter((c) => c.category === params.category);
    }

    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const total = courses.length;
    const start = (page - 1) * pageSize;
    const data = courses.slice(start, start + pageSize);

    return { data, total, page, page_size: pageSize };
  }

  // Real API
  // return request<PaginatedCourses>("/courses/search", {
  //   method: "POST",
  //   body: params,
  // });
  throw new Error("Not configured");
}

/**
 * Get a single course with full details (prerequisites, required_by, co_requisites).
 */
export async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);

    const mock = mockCurriculumCourses.find((c) => c.id === courseId);
    if (!mock) return null;
    return mockToDetail(mock);
  }

  // Real API
  // return request<CourseDetail>(`/courses/${courseId}`);
  throw new Error("Not configured");
}

/**
 * Get course recommendations for a student (based on curriculum, progress).
 * Currently returns courses the student hasn't completed yet.
 */
export async function getRecommendedCourses(studentId: string): Promise<Course[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);

    const completed = new Set(
      mockCurriculumCourses.filter((c) => c.completed).map((c) => c.id)
    );

    return mockCurriculumCourses
      .filter((c) => !completed.has(c.id))
      .map(mockToCourse);
  }

  // Real API
  // return request<Course[]>(`/students/${studentId}/recommended-courses`);
  throw new Error("Not configured");
}
