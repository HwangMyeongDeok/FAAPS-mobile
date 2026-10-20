/**
 * Course query hooks (React Query / TanStack Query).
 *
 * Usage:
 *   const { data, isLoading } = useCourses({ q: "programming" });
 *   const { data, isLoading } = useCourseDetail("c1");
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { searchCourses, getCourseDetail, getRecommendedCourses } from "@/lib/api/course";
import type { CoursesSearchParams } from "@/types/course";
import { useAuthStore } from "@/stores/auth";

// ── Query keys ────────────────────────────────────────────────────────────────

export const courseKeys = {
  all: ["courses"] as const,
  search: (params: CoursesSearchParams) => ["courses", "search", params] as const,
  detail: (id: string) => ["courses", "detail", id] as const,
  recommended: (studentId: string) => ["courses", "recommended", studentId] as const,
};

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Paginated course search with infinite scroll support.
 */
export function useCourses(params: CoursesSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: courseKeys.search(params),
    queryFn: ({ pageParam = 1 }) => searchCourses({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.page_size < lastPage.total;
      return hasMore ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Single course detail with prerequisites, required_by, co_requisites.
 */
export function useCourseDetail(courseId: string | null) {
  return useQuery({
    queryKey: courseKeys.detail(courseId ?? ""),
    queryFn: () => getCourseDetail(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60_000,
  });
}

/**
 * Recommended courses for the current student.
 */
export function useRecommendedCourses() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: courseKeys.recommended(userId ?? ""),
    queryFn: () => getRecommendedCourses(userId!),
    enabled: !!userId,
    staleTime: 2 * 60_000,
  });
}
