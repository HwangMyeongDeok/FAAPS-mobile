import type { TranscriptRow } from "@/types";

export const ORANGE = "#F36F21";
export const ORANGE_DEEP = "#B5460D";

export function gradeTone(grade: number | null, isDark: boolean): { bg: string; fg: string } {
  const value = grade ?? 0;
  if (value >= 8) {
    return isDark ? { bg: "#0B2E1F", fg: "#6EE7B7" } : { bg: "#DCFCE7", fg: "#047857" };
  }
  if (value >= 6.5) {
    return isDark ? { bg: "#2E1C0E", fg: "#FFA371" } : { bg: "#FFF1E7", fg: ORANGE_DEEP };
  }
  if (value >= 5) {
    return isDark ? { bg: "#3A2A0A", fg: "#FCD34D" } : { bg: "#FEF3C7", fg: "#92400E" };
  }
  return isDark ? { bg: "#3B0F0F", fg: "#FCA5A5" } : { bg: "#FEE2E2", fg: "#DC2626" };
}

/** The semesters of the transcript, newest first, with their rows. */
export interface TranscriptSemester {
  key: string;
  label: string;
  code: string;
  rows: TranscriptRow[];
  credits: number;
  earnedCredits: number;
  gpa: number | null;
}

export function groupBySemester(rows: TranscriptRow[]): TranscriptSemester[] {
  const map = new Map<string, TranscriptRow[]>();
  for (const row of rows) {
    const arr = map.get(row.semesterCode) ?? [];
    arr.push(row);
    map.set(row.semesterCode, arr);
  }
  return Array.from(map.entries()).map(([code, list]) => {
    const credits = list.reduce((s, r) => s + r.credits, 0);
    const earnedCredits = list.reduce((s, r) => s + (r.creditsEarned ?? 0), 0);
    const weighted = list.reduce((s, r) => s + (r.finalScore ?? 0) * r.credits, 0);
    return {
      key: code,
      label: list[0]?.semesterName ?? code,
      code,
      rows: list,
      credits,
      earnedCredits,
      gpa: credits === 0 ? null : Math.round((weighted / credits) * 100) / 100,
    };
  });
}

export function gpaLabel(gpa: number | null): string {
  if (gpa == null) return "No GPA yet";
  if (gpa >= 8) return "Excellent";
  if (gpa >= 6.5) return "Good";
  if (gpa >= 5) return "Average";
  return "Needs improvement";
}
