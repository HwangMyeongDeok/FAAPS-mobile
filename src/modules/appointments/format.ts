/**
 * Appointments module — date helpers and constants.
 * Pure functions, no dependencies, shared by the screen and its sections.
 */

export const ORANGE = "#F36F21";
export const ORANGE_DEEP = "#B5460D";

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const QUICK_REASONS = [
  "Study plan advice",
  "Choosing a specialization",
  "Registering for next semester",
  "Improving my GPA / retaking a course",
  "Internship & career direction",
];

export const CANCEL_REASONS = [
  "Unexpected class conflict",
  "Already discussed over messages",
  "I want a different time slot",
  "Personal reason",
];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function longDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function shortDate(dateStr: string): { day: string; mon: string; dow: string } {
  const d = parseISO(dateStr);
  const dows = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return {
    day: `${d.getDate()}`.padStart(2, "0"),
    mon: MONTHS[d.getMonth()].slice(0, 3),
    dow: dows[d.getDay()],
  };
}

/** Extract the time part of an ISO local date-time ("2026-11-12T09:00:00"). */
export function timeOf(iso: string): string {
  const match = /T(\d{2}:\d{2})/.exec(iso);
  return match ? match[1] : iso;
}

/** Extract the date part of an ISO local date-time. */
export function dateOf(iso: string): string {
  return iso.split("T")[0];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** 42 calendar cells for the month containing `cursor` — the week starts on Monday. */
export function monthCells(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  // JS: Sun=0..Sat=6 → shift so Mon=0..Sun=6
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
