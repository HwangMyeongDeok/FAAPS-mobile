/**
 * Course learning plan service — the student's per-course learning plan.
 *
 * A plan belongs to ONE course: the student picks a course, writes a
 * learning goal and lists the learning tasks, then ticks the tasks off as
 * the course progresses.
 *
 * NOTE ON THE TOGGLE ROUTE
 * -------------------------
 * The backend (`StudentPlanController`) exposes the task update as
 *   `PATCH /api/student/course-learning-plans/{planId}/tasks/{taskId}`
 * with the body `{ "completed": true|false }` — there is no `/toggle`
 * suffix. The response is the whole updated plan, so the caller can
 * refresh both the detail screen and the progress bars without a second
 * round trip.
 */
import { http } from "@/lib/http";
import type {
  CourseLearningPlan,
  CreateCourseLearningPlanInput,
  ToggleCourseTaskInput,
} from "@/types/course-learning-plan";

export type {
  CourseLearningPlan,
  CoursePlanHeader,
  CoursePlanTask,
  CoursePlanTaskInput,
  CoursePlanProgress,
  CreateCourseLearningPlanInput,
  ToggleCourseTaskInput,
} from "@/types/course-learning-plan";

/** `GET /api/student/course-learning-plans` — the latest plan of every course. */
export async function getCourseLearningPlans(): Promise<CourseLearningPlan[]> {
  return http.get<CourseLearningPlan[]>("/api/student/course-learning-plans");
}

/**
 * `POST /api/student/course-learning-plans`
 *
 * Creates a new plan for a course. The backend requires 1–100 tasks and
 * rejects courses that are outside the student's curriculum.
 */
export async function createCourseLearningPlan(
  input: CreateCourseLearningPlanInput,
): Promise<CourseLearningPlan> {
  return http.post<CourseLearningPlan>("/api/student/course-learning-plans", {
    courseId: input.courseId,
    learningGoal: input.learningGoal ?? null,
    tasks: input.tasks.map((task) => ({
      title: task.title,
      description: task.description ?? null,
      dueDate: task.dueDate ?? null,
      resourceUrl: task.resourceUrl ?? null,
    })),
  });
}

/** `GET /api/student/course-learning-plans/{id}` — one plan with its tasks. */
export async function getCourseLearningPlan(
  planId: string,
): Promise<CourseLearningPlan> {
  return http.get<CourseLearningPlan>(`/api/student/course-learning-plans/${planId}`);
}

/**
 * `PATCH /api/student/course-learning-plans/{planId}/tasks/{taskId}`
 *
 * Marks a task done / not done. Returns the updated plan.
 */
export async function toggleCourseLearningTask(
  planId: string,
  taskId: string,
  input: ToggleCourseTaskInput,
): Promise<CourseLearningPlan> {
  return http.patch<CourseLearningPlan>(
    `/api/student/course-learning-plans/${planId}/tasks/${taskId}`,
    { completed: input.completed },
  );
}
