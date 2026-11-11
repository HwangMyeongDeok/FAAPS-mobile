/**
 * Course service — search and detail.
 */
import { http } from "@/lib/http";
import type { Course, CourseDetail, CourseSearchParams } from "@/types/course";

/** `GET /api/student/courses?search=&page=&size=` — a flat, paginated list. */
export async function searchCourses(
  params: CourseSearchParams = {},
): Promise<Course[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));

  const suffix = query.toString();
  return http.get<Course[]>(`/api/student/courses?${suffix}`);
}

/** `GET /api/student/courses/{id}` */
export async function getCourseDetail(courseId: string): Promise<CourseDetail> {
  return http.get<CourseDetail>(`/api/student/courses/${courseId}`);
}
