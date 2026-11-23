/**
 * Transcript import service — preview → confirm flow for the student.
 *
 * Backend (FAAPS-backend, TranscriptImportController):
 *   POST /api/student/transcript/imports/preview       (multipart `file`)
 *   POST /api/student/transcript/imports/{id}/confirm
 *   GET  /api/student/transcript/imports
 *   GET  /api/student/transcript/imports/{id}
 *   GET  /api/student/transcript/imports/{id}/errors.xlsx
 *
 * Only .xlsx files are accepted. The backend refuses to confirm a preview
 * that still contains invalid rows, so the UI must force the user to fix
 * the file and preview again.
 */
import { http } from "@/lib/http";

export interface TranscriptImportRow {
  rowNumber: number;
  courseCode: string;
  semesterCode: string;
  finalScore: number | null;
  status: string;
  attemptNumber: number;
  error: string | null;
}

export interface TranscriptImportPreview {
  importId: string;
  rowCount: number;
  errorCount: number;
  rows: TranscriptImportRow[];
}

export interface TranscriptImportResult {
  importId: string;
  importedCount: number;
  status: string;
}

export interface TranscriptImportHistoryEntry {
  id: string;
  fileName: string;
  status: string;
  rowCount: number;
  errorCount: number;
  createdAt: string;
  confirmedAt: string | null;
}

export interface PickedXlsx {
  uri: string;
  name: string;
  mimeType: string;
}

/** `POST /api/student/transcript/imports/preview` — multipart upload. */
export async function previewImport(
  file: PickedXlsx,
): Promise<TranscriptImportPreview> {
  const body = new FormData();
  // React Native FormData: the part must carry uri + name + type.
  // Never set Content-Type manually — `send()` in http.ts drops it so
  // fetch generates the multipart boundary automatically.
  body.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  } as unknown as Blob);
  return http.post<TranscriptImportPreview>("/api/student/transcript/imports/preview", body);
}

/** `POST /api/student/transcript/imports/{id}/confirm` */
export async function confirmImport(
  importId: string,
): Promise<TranscriptImportResult> {
  return http.post<TranscriptImportResult>(
    `/api/student/transcript/imports/${importId}/confirm`,
  );
}

/** `GET /api/student/transcript/imports` — newest first (backend order). */
export async function getImportHistory(): Promise<TranscriptImportHistoryEntry[]> {
  return http.get<TranscriptImportHistoryEntry[]>("/api/student/transcript/imports");
}

/** `GET /api/student/transcript/imports/{id}` — re-open a past preview. */
export async function getImportDetail(
  importId: string,
): Promise<TranscriptImportPreview> {
  return http.get<TranscriptImportPreview>(`/api/student/transcript/imports/${importId}`);
}

/**
 * `GET /api/student/transcript/imports/{id}/errors.xlsx`
 * Returns the raw workbook bytes as a Blob. Callers decide how to
 * save/share it per platform (web anchor vs. native share sheet).
 */
export async function downloadErrorFile(importId: string): Promise<Blob> {
  return http.get<Blob>(`/api/student/transcript/imports/${importId}/errors.xlsx`, {
    response: "binary",
    headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
}
