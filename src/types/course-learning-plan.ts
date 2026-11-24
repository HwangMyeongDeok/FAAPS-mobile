/**
 * Course learning plan types — mirrors the backend
 * `StudentPlanDtos.CourseHeader` / `CoursePlan` / `Task` records.
 *
 * A course learning plan is the student's personal plan for ONE course:
 * a learning goal plus a list of learning tasks that can be ticked off.
 */

/** `StudentPlanDtos.CourseHeader` */
export interface CoursePlanHeader {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  /** Free-text goal of the student, up to 10 000 characters. */
  learningGoal: string | null;
  /** Version of this plan for the course (1 = the first one). */
  version: number;
  /** Id of the plan this one supersedes, if any. */
  previousPlanId: string | null;
  createdAt: string;
}

/** `StudentPlanDtos.Task` */
export interface CoursePlanTask {
  id: string;
  title: string;
  description: string | null;
  /** `yyyy-MM-dd` — the backend serialises a `LocalDate`. */
  dueDate: string | null;
  resourceUrl: string | null;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
}

/** `StudentPlanDtos.CoursePlan` */
export interface CourseLearningPlan {
  header: CoursePlanHeader;
  tasks: CoursePlanTask[];
}

/** `StudentPlanDtos.TaskInput` — the payload of one task when creating a plan. */
export interface CoursePlanTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  resourceUrl?: string | null;
}

/** `StudentPlanDtos.SaveCoursePlan` */
export interface CreateCourseLearningPlanInput {
  courseId: string;
  learningGoal?: string | null;
  tasks: CoursePlanTaskInput[];
}

/** `StudentPlanDtos.TaskProgress` */
export interface ToggleCourseTaskInput {
  completed: boolean;
}

/** Progress of one plan: how many tasks are done and the percentage. */
export interface CoursePlanProgress {
  total: number;
  completed: number;
  /** 0–100, rounded. */
  percent: number;
}
