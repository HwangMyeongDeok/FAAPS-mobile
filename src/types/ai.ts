/**
 * AI Assistant domain types.
 *
 * Two surfaces share one service layer:
 *   • `ai-chat.tsx`    — a conversational thread with cited sources
 *   • `ai-roadmap.tsx` — a generated semester-by-semester study plan
 *
 * Field names use snake_case to match the backend contract, the same
 * convention the rest of `src/types` follows.
 */

// ── Chat ─────────────────────────────────────────────────────────────────────

export type AiMessageRole = "user" | "assistant";

export type AiSourceKind = "curriculum" | "syllabus" | "regulation" | "advisor";

/**
 * A citation the assistant attached to one of its answers. The screen
 * renders these as numbered badges under the message and expands them
 * into a list of documents on demand.
 */
export interface AiSource {
  /** 1-based index — the badge number the student sees. */
  index: number;
  kind: AiSourceKind;
  /** Short document title, e.g. "Quy chế đào tạo K19". */
  title: string;
  /** The specific clause / section the answer leaned on. */
  locator: string;
  /** One line of what the source says, in the student's language. */
  excerpt: string;
}

export interface AiChatMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  sent_at: string;
  /** Only assistant messages carry sources and a rating. */
  sources?: AiSource[];
  /** "up" | "down" — the student's verdict on this answer. */
  rating?: "up" | "down" | null;
  /** True while the assistant is still writing this answer. */
  pending?: boolean;
}

/** A ready-made prompt the student can tap instead of typing. */
export interface AiPromptSuggestion {
  id: string;
  label: string;
  /** The full question actually sent to the assistant. */
  prompt: string;
}

// ── Roadmap ──────────────────────────────────────────────────────────────────

export type AiSemesterStatus = "completed" | "current" | "planned";

export interface AiRoadmapCourse {
  course_code: string;
  course_name: string;
  credits: number;
  /** CORE | ELECTIVE | PRACTICUM | PROJECT */
  category: string;
  /** Why the assistant put this course in this semester. */
  reason: string;
  /** Course codes that must be passed first. */
  prerequisites: string[];
}

export interface AiRoadmapSemester {
  /** 1..8 — the curriculum term number. */
  semester: number;
  /** "Kỳ 5" */
  label: string;
  /** e.g. "Fall 2026" */
  term: string;
  status: AiSemesterStatus;
  courses: AiRoadmapCourse[];
  /** The assistant's projected GPA for this term, on the 10-point scale. */
  projected_gpa: number;
  /** A one-line note about why this term is shaped the way it is. */
  note: string;
}

export interface AiRoadmap {
  id: string;
  generated_at: string;
  /** The constraint set the assistant optimised for. */
  strategy: string;
  /** Credits the student has already earned. */
  earned_credits: number;
  /** Credits the curriculum requires in total. */
  total_credits: number;
  /** Projected GPA across the whole remaining plan. */
  projected_gpa: number;
  /** "Spring 2028" — when the plan says the student graduates. */
  graduation_term: string;
  semesters: AiRoadmapSemester[];
}

// ── Service payloads ─────────────────────────────────────────────────────────

export interface AiChatThread {
  messages: AiChatMessage[];
}

export interface AiRoadmapRequest {
  /** Target GPA on the 10-point scale. */
  target_gpa: number;
  /** How many terms the assistant may spread the plan over. */
  preferred_terms: number;
  /** Free-text extra constraint, e.g. "ưu tiên môn AI". */
  note?: string;
}
