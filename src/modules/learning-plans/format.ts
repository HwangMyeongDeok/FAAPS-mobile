/**
 * Learning plans module — pure helpers shared by the screens and cards.
 */

export const ORANGE = "#F37021";
export const ORANGE_DEEP = "#B45309";

/** "30/09/2026" — the backend sends a `LocalDate` as `yyyy-MM-dd`. */
export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const [y, m, d] = dueDate.split("-");
  if (!y || !m || !d) return dueDate;
  return `${d}/${m}/${y}`;
}

/**
 * How far along a plan is, as a 0–100 percentage.
 *
 * A plan with no tasks counts as 0 % — the backend always creates a plan
 * with at least one task, but an empty list must not divide by zero.
 */
export function progressOf(tasks: { completed: boolean }[]): {
  total: number;
  completed: number;
  percent: number;
} {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

/** "2 of 5 tasks done" */
export function progressLabel(completed: number, total: number): string {
  return `${completed}/${total} task${total === 1 ? "" : "s"} done`;
}

/**
 * Whether a task is overdue: it has a due date, it is not done, and the
 * date has already passed.
 */
export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  return dueDate < todayIso;
}

/** "Today", "Tomorrow" or "30/09/2026" — a friendly due-date label. */
export function dueLabel(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = dueDate.split("-").map((v) => Number(v));
  if (!y || !m || !d) return formatDueDate(dueDate);
  const due = new Date(y, m - 1, d);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return formatDueDate(dueDate);
}
