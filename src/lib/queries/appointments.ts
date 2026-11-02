import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bookAppointment,
  cancelAppointment,
  getAvailability,
  getMyAppointments,
} from "@/lib/api/appointments";
import { useAuthStore } from "@/stores/auth";

export const appointmentKeys = {
  all: ["appointments"] as const,
  mine: (studentId: string) => ["appointments", "mine", studentId] as const,
  slots: (date: string) => ["appointments", "slots", date] as const,
};

export function useMyAppointments() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: studentId ? appointmentKeys.mine(studentId) : ["appointments", "mine", "none"],
    queryFn: () => getMyAppointments(studentId!),
    enabled: !!studentId,
    staleTime: 30_000,
  });
}

export function useAvailability(date: string | null) {
  return useQuery({
    queryKey: date ? appointmentKeys.slots(date) : ["appointments", "slots", "none"],
    queryFn: () => getAvailability(date!),
    enabled: !!date,
    staleTime: 30_000,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: (_appt, vars) => {
      if (studentId) qc.invalidateQueries({ queryKey: appointmentKeys.mine(studentId) });
      qc.invalidateQueries({ queryKey: appointmentKeys.slots(vars.date) });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelAppointment(id, reason),
    onSuccess: () => {
      if (studentId) qc.invalidateQueries({ queryKey: appointmentKeys.mine(studentId) });
      qc.invalidateQueries({ queryKey: ["appointments", "slots"] });
    },
  });
}
