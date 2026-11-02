/**
 * Transcript service — semester grades + OJT status (FE-S-3).
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 */
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import {
  mockTranscripts,
  type StudentTranscript,
  type OjtStatus,
  type TranscriptCourseGrade,
  type TranscriptOjt,
  type TranscriptSemester,
} from "@/lib/db/mockDb";

export type {
  StudentTranscript,
  OjtStatus,
  TranscriptCourseGrade,
  TranscriptOjt,
  TranscriptSemester,
};

export async function getTranscript(studentId: string): Promise<StudentTranscript | null> {
  if (config.isMockMode) {
    await mockDelay();
    const found = mockTranscripts.find((t) => t.student_id === studentId);
    if (!found) return null;
    // Deep clone so screens cannot mutate the shared mock seed.
    return JSON.parse(JSON.stringify(found)) as StudentTranscript;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<StudentTranscript>(`/api/students/${studentId}/transcript`, {
    token,
  });
}
