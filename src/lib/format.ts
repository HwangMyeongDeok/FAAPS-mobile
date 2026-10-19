import { format, formatDistanceToNow, parseISO } from "date-fns";

/** "07:42 30/09/2026" */
export const formatDateTimeVi = (iso: string) =>
  format(parseISO(iso), "HH:mm dd/MM/yyyy");

/** "30/09/2026" */
export const formatDateVi = (iso: string) => format(parseISO(iso), "dd/MM/yyyy");

/** "khoảng 2 giờ trước" / "2 hours ago" */
export const formatRelative = (iso: string) => formatDistanceToNow(parseISO(iso), { addSuffix: true });

/** GPA hiển thị với 2 chữ số, fallback "—" */
export const formatGpa = (gpa?: number | null) =>
  gpa == null ? "—" : gpa.toFixed(2);

/** Tín chỉ hiển thị "78 TC" */
export const formatCredits = (n: number) => `${n} TC`;

/** % làm tròn cho progress bar */
export const formatPercent = (n: number, total: number) =>
  total === 0 ? 0 : Math.round((n / total) * 100);