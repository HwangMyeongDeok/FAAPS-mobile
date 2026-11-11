import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCurriculumCourses } from "@/lib/api/curriculum";
import { getTranscript } from "@/lib/api/transcript";
import type { CurriculumCourse } from "@/types";

export interface GroupedSemester {
  /** The semester number inside the curriculum (1-based). */
  semester: number;
  totalCredits: number;
  earnedCredits: number;
  status: "completed" | "in_progress" | "upcoming";
  courses: CurriculumCourse[];
}

export const curriculumKeys = {
  all: ["curriculum"] as const,
  courses: () => ["curriculum", "courses"] as const,
  transcript: () => ["curriculum", "transcript"] as const,
};

/** The courses that make up the student's curriculum. */
export function useCurriculumCourses() {
  return useQuery({
    queryKey: curriculumKeys.courses(),
    queryFn: getCurriculumCourses,
    staleTime: 5 * 60_000,
  });
}

/**
 * The courses the student has already passed (or been exempted from).
 *
 * The backend derives the completion state from the transcript records, so
 * the curriculum itself carries no "completed" flag.
 */
export function useCompletedCourseIds() {
  const { data: transcript = [] } = useQuery({
    queryKey: curriculumKeys.transcript(),
    queryFn: getTranscript,
    staleTime: 5 * 60_000,
  });

  return useMemo(() => {
    const passed = new Set<string>();
    for (const row of transcript) {
      if (row.status === "PASSED" || row.status === "EXEMPTED") {
        passed.add(row.courseCode);
      }
    }
    return passed;
  }, [transcript]);
}

/**
 * The curriculum grouped by semester, with the completion state merged in.
 *
 * `currentSemester` is the semester the student is currently taking; the
 * semesters before it are done and the ones after it are still to come.
 */
export function useGroupedCourses(currentSemester?: number | null) {
  const { data: courses = [], isLoading, isError } = useCurriculumCourses();
  const completed = useCompletedCourseIds();

  return useMemo(() => {
    const map = new Map<number, CurriculumCourse[]>();
    for (const c of courses) {
      const arr = map.get(c.semesterNumber) ?? [];
      arr.push(c);
      map.set(c.semesterNumber, arr);
    }

    const current = currentSemester ?? 1;
    const groups: GroupedSemester[] = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([sem, list]) => {
        const totalCredits = list.reduce((s, c) => s + c.credits, 0);
        const earnedCredits = list
          .filter((c) => completed.has(c.code))
          .reduce((s, c) => s + c.credits, 0);
        const status: GroupedSemester["status"] =
          sem < current
            ? "completed"
            : sem === current
              ? "in_progress"
              : "upcoming";
        return { semester: sem, totalCredits, earnedCredits, status, courses: list };
      });

    return { groups, isLoading, isError };
  }, [courses, completed, currentSemester, isLoading, isError]);
}

/** Build a lookup of { course code → display name } for resolving prerequisites. */
export function useCourseLookup(): Record<string, string> {
  const { data: courses = [] } = useCurriculumCourses();
  return useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of courses) m[c.code] = `${c.code} · ${c.name}`;
    return m;
  }, [courses]);
}
