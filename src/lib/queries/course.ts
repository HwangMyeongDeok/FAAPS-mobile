/**
 * React Query hooks for course search and detail.
 */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getCourseDetail, searchCourses } from "@/lib/api/course";
import type { CourseSearchParams } from "@/types/course";

export const courseKeys = {
  all: ["courses"] as const,
  search: (params: CourseSearchParams) => ["courses", "search", params] as const,
  detail: (id: string) => ["courses", "detail", id] as const,
};

/**
 * Paginated course search with infinite scroll support.
 *
 * The backend pages from 0, so `pageParam` is the zero-based page index.
 */
export function useCourses(params: CourseSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: courseKeys.search(params),
    queryFn: ({ pageParam = 0 }) => searchCourses({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // The backend returns a plain list; a short page means the end.
      const size = params.size ?? 20;
      return lastPage.length < size ? undefined : lastPageParam + 1;
    },
  });
}

/** Single course detail with its prerequisites. */
export function useCourseDetail(courseId: string | null) {
  return useQuery({
    queryKey: courseKeys.detail(courseId ?? ""),
    queryFn: () => getCourseDetail(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60_000,
  });
}
