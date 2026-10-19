import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCourses } from "@/lib/api/curriculum";
import type { CurriculumCourse } from "@/lib/db/mockDb";
import { useMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";

export interface GroupedSemester {
  semester: number;
  totalCredits: number;
  earnedCredits: number;
  status: "completed" | "in_progress" | "upcoming";
  courses: CurriculumCourse[];
}

const currentSemesterFallback = 5;

export const curriculumKeys = {
  all: ["curriculum"] as const,
  courses: (cvId: string) => ["curriculum", "courses", cvId] as const,
};

export function useCurriculumCourses() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const { data: profile } = useMyProfile(userId);
  const cvId = profile?.curriculum_version.id;

  return useQuery({
    queryKey: cvId ? curriculumKeys.courses(cvId) : ["curriculum", "courses", "none"],
    queryFn: () => getCourses(cvId!),
    enabled: !!cvId,
    staleTime: 5 * 60_000,
  });
}

export function useGroupedCourses() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const { data: profile } = useMyProfile(userId);
  const { data: courses = [], isLoading, isError } = useCurriculumCourses();

  return useMemo(() => {
    if (courses.length === 0) {
      return { groups: [] as GroupedSemester[], isLoading, isError };
    }
    const map = new Map<number, CurriculumCourse[]>();
    for (const c of courses) {
      const arr = map.get(c.semester) ?? [];
      arr.push(c);
      map.set(c.semester, arr);
    }

    const current = profile?.student.current_semester ?? currentSemesterFallback;
    const groups: GroupedSemester[] = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([sem, list]) => {
        const totalCredits = list.reduce((s, c) => s + c.credits, 0);
        const earnedCredits = list.filter((c) => c.completed).reduce((s, c) => s + c.credits, 0);
        const status: GroupedSemester["status"] =
          sem < current ? "completed" : sem === current ? "in_progress" : "upcoming";
        return { semester: sem, totalCredits, earnedCredits, status, courses: list };
      });

    return { groups, isLoading, isError };
  }, [courses, profile, isLoading, isError]);
}

/** Build a lookup of { course_id → course_code } for resolving prereqs. */
export function useCourseLookup(): Record<string, string> {
  const { data: courses = [] } = useCurriculumCourses();
  return useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of courses) m[c.id] = `${c.course_code} · ${c.name}`;
    return m;
  }, [courses]);
}
