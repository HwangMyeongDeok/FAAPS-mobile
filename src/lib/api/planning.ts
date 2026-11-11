/**
 * Study plan service — the student's own semester plans.
 *
 * A plan belongs to one semester: the student picks the courses, saves the
 * plan as a draft, and submits it for the advisor to review.
 */
import { http } from "@/lib/http";
import type { CurriculumPlan, PlanSemester } from "@/types";

export type { CurriculumPlan, PlanHeader, PlanCourse, PlanSemester } from "@/types";

/** `GET /api/student/semesters` */
export async function getSemesters(): Promise<PlanSemester[]> {
  return http.get<PlanSemester[]>("/api/student/semesters");
}

/** `GET /api/student/study-plans` — the current plan of every semester. */
export async function getStudyPlans(): Promise<CurriculumPlan[]> {
  return http.get<CurriculumPlan[]>("/api/student/study-plans");
}

/** `GET /api/student/study-plans/{id}` */
export async function getStudyPlan(planId: string): Promise<CurriculumPlan> {
  return http.get<CurriculumPlan>(`/api/student/study-plans/${planId}`);
}

/** `GET /api/student/study-plans/{id}/validate` — the list of plan issues. */
export async function validateStudyPlan(planId: string): Promise<string[]> {
  return http.get<string[]>(`/api/student/study-plans/${planId}/validate`);
}

/**
 * `POST /api/student/study-plans`
 *
 * Creates (or supersedes) the plan of one semester. `courseIds` are the
 * course ids — the backend rejects courses outside the curriculum.
 */
export async function saveStudyPlan(input: {
  semesterId: string;
  planType?: string;
  courseIds: string[];
}): Promise<CurriculumPlan> {
  return http.post<CurriculumPlan>("/api/student/study-plans", {
    semesterId: input.semesterId,
    planType: input.planType ?? "REGULAR",
    courseIds: input.courseIds,
  });
}

/** `POST /api/student/study-plans/{id}/submit` — sends the plan for review. */
export async function submitStudyPlan(planId: string): Promise<CurriculumPlan> {
  return http.post<CurriculumPlan>(`/api/student/study-plans/${planId}/submit`);
}
