import { format, formatDistanceToNow, parseISO } from "date-fns";

/** "07:42 30/09/2026" */
export const formatDateTime = (iso: string) =>
  format(parseISO(iso), "HH:mm dd/MM/yyyy");

/** "30/09/2026" */
export const formatDate = (iso: string) => format(parseISO(iso), "dd/MM/yyyy");

/** "about 2 hours ago" */
export const formatRelative = (iso: string) =>
  formatDistanceToNow(parseISO(iso), { addSuffix: true });

/** A GPA shown with two decimals, falling back to "—" */
export const formatGpa = (gpa?: number | null) =>
  gpa == null ? "—" : gpa.toFixed(2);

/** A credit count shown as "78 cr" */
export const formatCredits = (n: number) => `${n} cr`;

/** A percentage rounded for the progress bar */
export const formatPercent = (n: number, total: number) =>
  total === 0 ? 0 : Math.round((n / total) * 100);
