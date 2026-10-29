/**
 * Planning service — AI-generated study plans.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 */
import type { GeneratePlanInput } from "@/modules/planning/schemas/planning.schema";
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import { mockCurriculumCourses, mockSemesters } from "@/lib/db/mockDb";

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

/** Build a deterministic-ish mock plan. */
function buildMockPlan(studentId: string, seed: number = Date.now()): StudyPlan {
  const sems = mockSemesters.slice(0, 6);
  const pending = mockCurriculumCourses.filter((c) => !c.completed);

  return {
    id: `plan-${studentId}`,
    student_id: studentId,
    generated_at: new Date(seed).toISOString(),
    status: "published",
    total_credits: pending.reduce((s, c) => s + c.credits, 0),
    semesters: sems.map((sem, idx) => {
      const courses = pending
        .filter((_, i) => i % sems.length === idx)
        .slice(0, 4)
        .map((c) => ({
          course_id: c.id,
          course_code: c.course_code,
          course_name: c.name,
          credits: c.credits,
          reason: `Prerequisite chain for ${c.name}`,
        }));
      return {
        semester_id: sem.id,
        semester_label: sem.label,
        courses,
        projected_gpa: Math.round((7.5 + (seed % 10) / 10) * 100) / 100,
      };
    }),
  };
}

export async function getStudyPlan(studentId: string): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await mockDelay();
    return buildMockPlan(studentId);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<StudyPlan>(`/api/students/${studentId}/study-plan`, { token });
}

/**
 * Ask the AI to re-generate the plan with new constraints.
 * A real backend hits the LLM here and takes 5–20s.
 */
export async function regenerateStudyPlan(
  studentId: string,
  input: GeneratePlanInput,
): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await mockDelay(1600);
    return buildMockPlan(studentId, Date.now());
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<StudyPlan>(`/api/students/${studentId}/study-plan/regenerate`, input, { token });
}

/** Save the current plan as draft (student can edit before publishing) */
export async function savePlanDraft(studentId: string, plan: StudyPlan): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await mockDelay();
    return { ...plan, status: "draft" };
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<StudyPlan>(`/api/students/${studentId}/study-plan/draft`, plan, { token });
}

export async function publishPlan(studentId: string, planId: string): Promise<StudyPlan | null> {
  if (config.isMockMode) {
    await mockDelay();
    const plan = buildMockPlan(studentId);
    return { ...plan, id: planId, status: "published" };
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<StudyPlan>(
    `/api/students/${studentId}/study-plan/${planId}/publish`,
    undefined,
    { token },
  );
}
