/**
 * Transcript service — the official record of the student's results.
 */
import { http } from "@/lib/http";
import type { AcademicProgress, TranscriptRow } from "@/types";

/** `GET /api/student/transcript` — one row per course attempt. */
export async function getTranscript(): Promise<TranscriptRow[]> {
  return http.get<TranscriptRow[]>("/api/student/transcript");
}

/** `GET /api/student/progress` */
export async function getProgress(): Promise<AcademicProgress> {
  return http.get<AcademicProgress>("/api/student/progress");
}
