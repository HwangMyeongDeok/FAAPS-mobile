/**
 * Planning service — AI-generated study plans.
 *
 * Real backend will likely expose:
 *   GET  /students/:id/study-plan               (current plan)
 *   POST /students/:id/study-plan/regenerate    (force a new plan)
 *   POST /students/:id/study-plan/draft         (save draft tweaks)
 *
 * Mock data returns a deterministic-ish plan so the UI demo always works.
 */
import type { GeneratePlanInput } from "@/modules/planning/schemas/planning.schema";
import { config } from "@/config/api";
import { request } from "@/lib/http";
import { mockCurriculumCourses, mockSemesters } from "@/lib/db/mockDb";

const NETWORK_DELAY_MS = 1200;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface StudyPlan {
  id: string;
  student_id: string;
  generated_at: string;
  status: "draft" | "published";
  total_credits: number;
  semesters: SemesterPlan[];
}

export interface SemesterPlan {
  semester_id: string;
  semester_label: string;
  courses: CoursePlan[];
  projected_gpa: number;
}

export interface CoursePlan {
  course_id: string;
  course_code: string;
  course_name: string;
  credits: number;
  reason: string;
}

function buildMockPlan(studentId: string, seed: number = Date.now()): StudyPlan {
  const sems = mockSemesters.slice(0, 6);
  return {
    id: "plan-1",
    student_id: studentId,
    generated_at: new Date(seed).toISOString(),
    status: "published",
    total_credits: 72,
    semesters: sems.map((sem, idx) => ({
      semester_id: sem.id,
      semester_label: sem.label,
      courses: mockCurriculumCourses
        .filter((_, i) => i % sems.length === idx)
        .slice(0, 4)
        .map((c) => ({
          course_id: c.id,
          course_code: c.course_code,
          course_name: c.name,
          credits: c.credits,
          reason: `Prerequisite for advanced ${c.name}`,
        })),
      projected_gpa: 7.5 + (seed % 10) / 10,
    })),
  };
}

export async function getStudyPlan(studentId: string): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return buildMockPlan(studentId);
  }
  // return request<StudyPlan>(`/students/${studentId}/study-plan`);
  throw new Error("Not configured");
}

/**
 * Ask the AI to re-generate the plan with new constraints.
 * In a real backend this will hit the model (LLM) and take 5–20s.
 */
export async function regenerateStudyPlan(
  studentId: string,
  input: GeneratePlanInput,
): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS * 2);
    return buildMockPlan(studentId, Date.now());
  }
  // return request<StudyPlan>(`/students/${studentId}/study-plan/regenerate`, {
  //   method: "POST", body: input,
  // });
  throw new Error("Not configured");
}

/** Save the current plan as draft (student can edit before publishing) */
export async function savePlanDraft(studentId: string, plan: StudyPlan): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await wait(600);
    return { ...plan, status: "draft" };
  }
  // return request<StudyPlan>(`/students/${studentId}/study-plan/draft`, { method: "POST", body: plan });
  throw new Error("Not configured");
}

export async function publishPlan(studentId: string, planId: string): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await wait(600);
    return getStudyPlan(studentId);
  }
  // return request<StudyPlan>(`/students/${studentId}/study-plan/${planId}/publish`, { method: "POST" });
  throw new Error("Not configured");
}