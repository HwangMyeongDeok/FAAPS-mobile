/**
 * React Query hooks for the appointment booking.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bookAppointment,
  cancelAppointment,
  getAvailability,
  getMyAppointments,
} from "@/lib/api/appointments";

export const appointmentKeys = {
  all: ["appointments"] as const,
  mine: () => ["appointments", "mine"] as const,
  slots: (date: string, advisorId?: string) =>
    ["appointments", "slots", date, advisorId ?? "assigned"] as const,
};

export function useMyAppointments() {
  return useQuery({
    queryKey: appointmentKeys.mine(),
    queryFn: getMyAppointments,
    staleTime: 30_000,
  });
}

/**
 * The free slots of one day.
 *
 * The query is disabled while there is no advisor to book with: the
 * availability endpoint needs one, and asking without it would only
 * produce a confusing error.
 */
export function useAvailability(
  date: string | null,
  advisorId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: date
      ? appointmentKeys.slots(date, advisorId)
      : ["appointments", "slots", "none"],
    queryFn: () => getAvailability(date!, advisorId),
    enabled: enabled && !!date && !!advisorId,
    staleTime: 30_000,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.mine() });
      qc.invalidateQueries({ queryKey: ["appointments", "slots"] });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.mine() });
      qc.invalidateQueries({ queryKey: ["appointments", "slots"] });
    },
  });
}
