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

export function useAvailability(date: string | null, advisorId?: string) {
  return useQuery({
    queryKey: date
      ? appointmentKeys.slots(date, advisorId)
      : ["appointments", "slots", "none"],
    queryFn: () => getAvailability(date!, advisorId),
    enabled: !!date,
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
