/**
 * Curriculum service — the student's curriculum, its courses and semesters.
 */
import { http } from "@/lib/http";
import type { Curriculum, CurriculumCourse } from "@/types";

/** `GET /api/student/curriculum` */
export async function getCurriculum(): Promise<Curriculum> {
  return http.get<Curriculum>("/api/student/curriculum");
}

/** `GET /api/student/curriculum/courses` */
export async function getCurriculumCourses(): Promise<CurriculumCourse[]> {
  return http.get<CurriculumCourse[]>("/api/student/curriculum/courses");
}
