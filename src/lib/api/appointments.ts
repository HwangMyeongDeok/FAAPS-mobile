/**
 * Appointments service — booking a 1-1 session with the advisor.
 */
import { http } from "@/lib/http";
import type {
  AvailableSlot,
  BookAppointmentInput,
  BookedAppointment,
} from "@/types";

/**
 * `GET /api/appointments/available-slots?date=&advisorId=`
 *
 * The backend returns the free 30-minute windows on the requested day. When
 * no advisor is given it uses the student's assigned advisor.
 */
export async function getAvailability(
  date: string,
  advisorId?: string,
): Promise<AvailableSlot[]> {
  const query = new URLSearchParams({ date });
  if (advisorId) query.set("advisorId", advisorId);
  return http.get<AvailableSlot[]>(`/api/appointments/available-slots?${query}`);
}

/** `GET /api/student/appointments` */
export async function getMyAppointments(): Promise<BookedAppointment[]> {
  return http.get<BookedAppointment[]>("/api/student/appointments");
}

/**
 * `POST /api/student/appointments`
 *
 * `startTime` is an ISO local date-time, e.g. `2026-11-12T09:00:00`.
 */
export async function bookAppointment(
  input: BookAppointmentInput,
): Promise<BookedAppointment> {
  return http.post<BookedAppointment>("/api/student/appointments", {
    advisorId: input.advisorId,
    startTime: input.startTime,
    reason: input.reason,
  });
}

/** `PUT /api/appointments/{id}/cancel` */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string,
): Promise<BookedAppointment> {
  return http.put<BookedAppointment>(
    `/api/appointments/${appointmentId}/cancel`,
    reason ? { reason } : undefined,
  );
}
