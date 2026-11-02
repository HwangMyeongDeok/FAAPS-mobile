/**
 * Appointments service — advisor 1-1 booking (mock-first).
 *
 * Mirrors the pattern in `src/lib/api/advisor.ts`:
 * mock branch reads/writes the in-memory array below, the `else`
 * branch already holds the real HTTP contract for later wiring.
 */
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";

export type AppointmentStatus = "upcoming" | "cancelled" | "completed";

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  available: boolean;
}

export interface Appointment {
  id: string;
  student_id: string;
  advisor_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
  location: string;
  created_at: string;
  cancel_reason?: string | null;
}

// ── Seed: always relative to *today* so "upcoming" never goes stale ──────────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

/** Next weekday (Mon–Sat) at least `minOffset` days out. */
function nextWorkday(minOffset: number): Date {
  const today = new Date();
  let d = addDays(today, minOffset);
  while (d.getDay() === 0) d = addDays(d, 1);
  return d;
}

const seedDay1 = nextWorkday(2);
const seedDay2 = nextWorkday(5);

export const mockAppointments: Appointment[] = [
  {
    id: "appt-seed-1",
    student_id: "u-student-duc",
    advisor_id: "u-advisor-1",
    date: toISODate(seedDay1),
    start_time: "09:00",
    end_time: "09:30",
    reason: "Tư vấn kế hoạch học kỳ tới, chọn môn CORE phù hợp với GPA hiện tại.",
    status: "upcoming",
    location: "Phòng 305 · Tòa Beta",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "appt-seed-2",
    student_id: "u-student-duc",
    advisor_id: "u-advisor-1",
    date: toISODate(seedDay2),
    start_time: "14:30",
    end_time: "15:00",
    reason: "Trao đổi về định hướng chuyên ngành AI và lộ trình môn tự chọn.",
    status: "upcoming",
    location: "Online · Google Meet",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "appt-seed-1-u1",
    student_id: "u-student-1",
    advisor_id: "u-advisor-1",
    date: toISODate(nextWorkday(3)),
    start_time: "10:00",
    end_time: "10:30",
    reason: "Hỏi về đăng ký môn điện tử kỳ tới.",
    status: "upcoming",
    location: "Phòng 305 · Tòa Beta",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// ── Availability ─────────────────────────────────────────────────────────────

const MORNING = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const AFTERNOON = ["13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function endOf(start: string): string {
  const [h, m] = start.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m + 30);
  return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d) < today;
}

function isToday(dateStr: string): boolean {
  return toISODate(new Date()) === dateStr;
}

export function buildSlotsForDate(dateStr: string): TimeSlot[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  // Advisor nghỉ Chủ nhật
  if (weekday === 0) return [];

  const all = [...MORNING, ...AFTERNOON];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return all.map((start) => {
    const [h, mi] = start.split(":").map(Number);
    const slotMin = h * 60 + mi;
    let available = true;
    if (isPastDate(dateStr)) available = false;
    else if (isToday(dateStr) && slotMin <= nowMin + 60) available = false;
    else if (hashStr(`${dateStr}-${start}`) % 3 === 0) available = false;

    // Khung đã có lịch upcoming của chính advisor cũng coi như bận
    const clash = mockAppointments.some(
      (a) => a.date === dateStr && a.start_time === start && a.status === "upcoming",
    );
    if (clash) available = false;

    return { id: `${dateStr}-${start}`, date: dateStr, start, end: endOf(start), available };
  });
}

// ── API ──────────────────────────────────────────────────────────────────────

export async function getAvailability(dateStr: string): Promise<TimeSlot[]> {
  if (config.isMockMode) {
    await mockDelay(350);
    return buildSlotsForDate(dateStr);
  }
  const token = await getAuthToken();
  return http.get<TimeSlot[]>(`/api/advisors/me/availability?date=${dateStr}`, { token });
}

export async function getMyAppointments(studentId: string): Promise<Appointment[]> {
  if (config.isMockMode) {
    await mockDelay(400);
    return mockAppointments
      .filter((a) => a.student_id === studentId)
      .sort((a, b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`));
  }
  const token = await getAuthToken();
  return http.get<Appointment[]>(`/api/students/${studentId}/appointments`, { token });
}

export async function bookAppointment(input: {
  student_id: string;
  advisor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  location?: string;
}): Promise<Appointment> {
  if (config.isMockMode) {
    await mockDelay(700);
    const appt: Appointment = {
      id: `appt-${Date.now()}`,
      student_id: input.student_id,
      advisor_id: input.advisor_id,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      reason: input.reason,
      status: "upcoming",
      location: input.location ?? "Phòng 305 · Tòa Beta",
      created_at: new Date().toISOString(),
    };
    mockAppointments.push(appt);
    return appt;
  }
  const token = await getAuthToken();
  return http.post<Appointment>(`/api/students/${input.student_id}/appointments`, input, { token });
}

export async function cancelAppointment(appointmentId: string, reason: string): Promise<void> {
  if (config.isMockMode) {
    await mockDelay(500);
    const a = mockAppointments.find((x) => x.id === appointmentId);
    if (a) {
      a.status = "cancelled";
      a.cancel_reason = reason;
    }
    return;
  }
  const token = await getAuthToken();
  await http.post<void>(`/api/appointments/${appointmentId}/cancel`, { reason }, { token });
}
