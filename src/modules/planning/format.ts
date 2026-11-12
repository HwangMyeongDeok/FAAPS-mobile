export const ORANGE = "#F36F21";
export const ORANGE_DEEP = "#B5460D";

/** The status the backend reports for a plan the student still owns. */
export type PlanStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | string;

/**
 * A course as the editor needs it: the curriculum row when we have it,
 * otherwise the plan's own row.
 */
export interface EditorCourseRow {
  courseId: string;
  code: string;
  name: string;
  credits: number;
  semesterNumber: number;
  mandatory: boolean;
}

export function statusLabel(status: PlanStatus): string {
  switch (status?.toUpperCase()) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
    case "PENDING_REVIEW":
      return "Awaiting review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Changes requested";
    default:
      return "Draft";
  }
}

export function statusTone(status: PlanStatus): { bg: string; fg: string } {
  switch (status?.toUpperCase()) {
    case "SUBMITTED":
    case "PENDING_REVIEW":
      return { bg: "#FFF1E7", fg: ORANGE_DEEP };
    case "APPROVED":
      return { bg: "#DCFCE7", fg: "#15803D" };
    case "REJECTED":
      return { bg: "#FEE2E2", fg: "#B91C1C" };
    default:
      return { bg: "#F2EDE7", fg: "#6A6058" };
  }
}
