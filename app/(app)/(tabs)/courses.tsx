/**
 * FE-S-4 — Course catalogue and detail.
 *
 * Features:
 * - Search courses by code or name
 * - View course details, objectives, learning outcomes and prerequisites
 *
 * Data comes straight from `GET /api/student/courses` and
 * `GET /api/student/courses/{id}`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge, Separator, Sheet } from "@/components/ui";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCourseDetail, useCourses } from "@/lib/queries/course";
import { courseCategoryVisual } from "@/modules/curriculum";
import type { Course } from "@/types/course";

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function CoursesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Debounce search
  const debouncedQuery = useDebounce(searchQuery, 300);

  const params = useMemo(
    () => ({
      search: debouncedQuery || undefined,
      size: 20,
    }),
    [debouncedQuery],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourses(params);

  const courses = useMemo(
    () => data?.pages.flatMap((p) => p) ?? [],
    [data],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCoursePress = useCallback((course: Course) => {
    setSelectedCourseId(course.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedCourseId(null);
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScreenHeader
        title="Course catalogue"
        subtitle="Search and explore every course in the catalogue"
      />

      <View className="px-4 pt-2 pb-3">
        {/* Search bar */}
        <View className="flex-row items-center gap-2 bg-surface dark:bg-surface-dark rounded-2xl px-3 py-2 border border-line dark:border-line-dark">
          <MaterialCommunityIcons name="magnify" size={20} color="#8B8178" />
          <TextInput
            className="flex-1 text-sm text-ink dark:text-ink-dark"
            placeholder="Search by course code or name..."
            placeholderTextColor="#8B8178"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#8B8178"
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Course list */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View className="h-1" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={async () => {
              await refetch();
            }}
            tintColor="#F36F21"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#F36F21" />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <MaterialCommunityIcons
                name="book-search-outline"
                size={48}
                color="#8B8178"
              />
              <Text className="text-ink-faint dark:text-ink-faint-dark mt-3 text-sm">
                No courses found.
              </Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <CourseListItem course={item} onPress={handleCoursePress} />
        )}
      />

      {/* Loading state */}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-ground/60 dark:bg-ground-dark/60">
          <ActivityIndicator color="#F36F21" size="large" />
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-ground/80 dark:bg-ground-dark/80">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#EF4444"
          />
          <Text className="text-red-500 mt-3">
            Could not load the course list.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 px-6 py-3 rounded-xl bg-[#F36F21]"
          >
            <Text className="text-white text-sm font-semibold">Try again</Text>
          </Pressable>
        </View>
      )}

      {/* Course detail sheet */}
      <CourseDetailSheetWrapper
        courseId={selectedCourseId}
        onClose={handleCloseDetail}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course List Item
// ─────────────────────────────────────────────────────────────────────────────

interface CourseListItemProps {
  course: Course;
  onPress: (course: Course) => void;
}

function CourseListItem({ course, onPress }: CourseListItemProps) {
  const cat = courseCategoryVisual(course.category);

  return (
    <Pressable
      onPress={() => onPress(course)}
      accessibilityRole="button"
      accessibilityLabel={`${course.code} ${course.name}`}
      className="bg-surface dark:bg-surface-dark rounded-2xl p-4 border border-line dark:border-line-dark"
    >
      <View className="flex-row items-start gap-3">
        {/* Category indicator */}
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${cat.color}1A` }}
        >
          <MaterialCommunityIcons
            name={cat.iconName as any}
            size={20}
            color={cat.color}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            className="text-sm font-semibold text-ink dark:text-ink-dark"
            numberOfLines={2}
          >
            {course.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-ink-muted dark:text-ink-muted-dark font-mono">
              {course.code}
            </Text>
            <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
              ·
            </Text>
            <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
              {course.credits} credits
            </Text>
          </View>
        </View>

        {/* Category badge */}
        <Badge variant={categoryBadgeVariant(course.category)} className="px-2 py-0.5">
          {cat.label}
        </Badge>
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Detail Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface CourseDetailSheetWrapperProps {
  courseId: string | null;
  onClose: () => void;
}

function CourseDetailSheetWrapper({
  courseId,
  onClose,
}: CourseDetailSheetWrapperProps) {
  const { data: detail, isLoading } = useCourseDetail(courseId);

  return (
    <Sheet open={!!courseId} onClose={onClose}>
      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#F36F21" />
        </View>
      ) : detail ? (
        <CourseDetailView detail={detail} />
      ) : (
        <View className="items-center py-8">
          <Text className="text-ink-muted dark:text-ink-muted-dark">
            Course information not found.
          </Text>
        </View>
      )}
    </Sheet>
  );
}

function CourseDetailView({
  detail,
}: {
  detail: NonNullable<
    Awaited<ReturnType<typeof useCourseDetail>>["data"]
  >;
}) {
  const { course, prerequisites } = detail;
  const cat = courseCategoryVisual(course.category);

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-start gap-3 mb-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${cat.color}1A` }}
        >
          <MaterialCommunityIcons
            name={cat.iconName as any}
            size={24}
            color={cat.color}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-lg font-bold text-ink dark:text-ink-dark"
            numberOfLines={2}
          >
            {course.name}
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mt-0.5 font-mono">
            {course.code} · {course.credits} credits
          </Text>
        </View>
        <Badge variant={categoryBadgeVariant(course.category)}>{cat.label}</Badge>
      </View>

      <Separator className="my-3" />

      {/* Description */}
      {course.description ? (
        <>
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
            Description
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mb-3">
            {course.description}
          </Text>
        </>
      ) : null}

      {/* Objectives */}
      {course.objectives ? (
        <>
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
            Objectives
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mb-3">
            {course.objectives}
          </Text>
        </>
      ) : null}

      {/* Learning Outcomes */}
      {course.learningOutcomes ? (
        <>
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
            Learning outcomes
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mb-3">
            {course.learningOutcomes}
          </Text>
        </>
      ) : null}

      <Separator className="my-3" />

      {/* Prerequisites */}
      <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-2">
        Prerequisites
      </Text>
      {prerequisites.length === 0 ? (
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
          <Text className="text-sm text-emerald-600">
            No prerequisites required.
          </Text>
        </View>
      ) : (
        <View className="gap-2 mb-3">
          {prerequisites.map((prereq) => (
            <View
              key={prereq.id}
              className="flex-row items-center gap-2 bg-raised dark:bg-raised-dark rounded-lg px-3 py-2"
            >
              <MaterialCommunityIcons name="arrow-up" size={14} color="#64748B" />
              <Text className="text-sm text-ink dark:text-ink-dark flex-1">
                {prereq.courseCode} – {prereq.courseName}
              </Text>
              {prereq.minimumScore != null && (
                <Badge variant="secondary" className="px-1.5 py-0">
                  ≥ {prereq.minimumScore}
                </Badge>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function categoryBadgeVariant(
  category?: string | null,
): "default" | "secondary" | "success" | "warning" | "destructive" {
  switch (courseCategoryVisual(category).iconName) {
    case "layers-triple":
      return "secondary";
    case "flask":
      return "success";
    case "school":
      return "warning";
    default:
      return "default";
  }
}

// ── Simple debounce hook ─────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
