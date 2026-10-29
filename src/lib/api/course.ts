/**
 * Course service — search / detail / recommendations.
 *
 * Data flow:
 *   Screen → Query hook → Service function → mock DB (or real API later)
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
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
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import {
  mockCurriculumCourses,
  mockCourseDetails,
  type CurriculumCourse,
} from "@/lib/db/mockDb";

// ── Mock helpers ─────────────────────────────────────────────────────────────

/** Convert our internal mock format to the Course type. */
function mockToCourse(mock: CurriculumCourse): Course {
  const details = mockCourseDetails[mock.course_code];
  return {
    id: mock.id,
    code: mock.course_code,
    name: mock.name,
    credits: mock.credits,
    category: mockTypeToCategory(mock.type),
    description: details?.description ?? null,
    objectives: details?.objectives ?? null,
    learning_outcomes: details?.learning_outcomes ?? null,
    status: "ACTIVE",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };
}

function mockTypeToCategory(type: CurriculumCourse["type"]): Course["category"] {
  switch (type) {
    case "CORE":
      return "CORE";
    case "ELECTIVE":
      return "ELECTIVE";
    case "PRACTICUM":
      return "PRACTICUM";
    case "PROJECT":
      return "PROJECT";
    default:
      return "OTHER";
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
      prerequisite_course: prereqMock
        ? mockToCourse(prereqMock)
        : {
            id: pid,
            code: pid,
            name: pid,
            credits: 0,
            category: "OTHER",
            status: "ACTIVE",
            created_at: "",
            updated_at: "",
          },
      group_no: idx + 1,
      type: "PREREQUISITE" as PrerequisiteType,
      minimum_score: null,
    };
  });

  // Reverse: courses that require this one
  const requiredBy = mockCurriculumCourses
    .filter((c) => c.prerequisites.includes(mock.id))
    .map((c) => ({ id: c.id, code: c.course_code, name: c.name }));

  // Co-requisites: courses in the same semester sharing a type
  const coRequisites = mockCurriculumCourses
    .filter((c) => c.semester === mock.semester && c.type === mock.type && c.id !== mock.id)
    .map(mockToCourse);

  return {
    ...course,
    prerequisites,
    required_by: requiredBy,
    co_requisites: coRequisites,
  };
}

// ── API functions ────────────────────────────────────────────────────────────

/**
 * Search/list courses with optional filters (paginated).
 */
export async function searchCourses(
  params: CoursesSearchParams = {},
): Promise<PaginatedCourses> {
  if (config.isMockMode) {
    await mockDelay();

    const q = (params.q ?? "").toLowerCase().trim();
    let courses = mockCurriculumCourses.map(mockToCourse);

    if (q) {
      courses = courses.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      );
    }

    if (params.category) {
      courses = courses.filter((c) => c.category === params.category);
    }

    if (params.status) {
      courses = courses.filter((c) => c.status === params.status);
    }

    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const total = courses.length;
    const start = (page - 1) * pageSize;

    return { data: courses.slice(start, start + pageSize), total, page, page_size: pageSize };
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<PaginatedCourses>("/api/courses/search", params, { token });
}

/**
 * Get a single course with full details (prerequisites, required_by, co_requisites).
 */
export async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
  if (config.isMockMode) {
    await mockDelay();

    const mock = mockCurriculumCourses.find((c) => c.id === courseId);
    if (!mock) return null;
    return mockToDetail(mock);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<CourseDetail>(`/api/courses/${courseId}`, { token });
}

/**
 * Get course recommendations for a student (based on curriculum + progress).
 * Mock: returns the courses the student has not completed yet.
 */
export async function getRecommendedCourses(studentId: string): Promise<Course[]> {
  if (config.isMockMode) {
    await mockDelay();

    const completed = new Set(
      mockCurriculumCourses.filter((c) => c.completed).map((c) => c.id),
    );

    return mockCurriculumCourses
      .filter((c) => !completed.has(c.id))
      .map(mockToCourse);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<Course[]>(`/api/students/${studentId}/recommended-courses`, { token });
}
