/**
 * FE-S-4: Course and Learning Resource Exploration
 *
 * Features:
 * - Search courses by code/name
 * - Filter by category (CORE, ELECTIVE, PRACTICUM, PROJECT)
 * - View course details, syllabus, prerequisites, and relationships
 * - Recommended courses for the student
 *
 * @see Report FE-S-4
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
import type { Course, CourseCategory } from "@/types/course";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FilterTab = "all" | CourseCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "Tất cả"      },
  { key: "CORE",      label: "Core"         },
  { key: "ELECTIVE",  label: "Elective"     },
  { key: "PRACTICUM",label: "Practicum"    },
  { key: "PROJECT",   label: "Project"      },
];

const CATEGORY_CONFIG: Record<
  CourseCategory,
  { label: string; color: string; bgColor: string }
> = {
  CORE:      { label: "Core",      color: "#2563EB", bgColor: "#DBEAFE" },
  ELECTIVE:  { label: "Elective",  color: "#7C3AED", bgColor: "#EDE9FE" },
  PRACTICUM: { label: "Practicum",color: "#059669", bgColor: "#D1FAE5" },
  PROJECT:   { label: "Project",   color: "#D97706", bgColor: "#FEF3C7" },
  FUNDAMENTAL:{ label: "Fundamental",color: "#64748B", bgColor: "#F1F5F9" },
  OTHER:     { label: "Khác",      color: "#64748B", bgColor: "#F1F5F9" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function CoursesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Debounce search
  const debouncedQuery = useDebounce(searchQuery, 300);

  const params = useMemo(
    () => ({
      q: debouncedQuery || undefined,
      category: activeFilter === "all" ? undefined : activeFilter,
      page_size: 20,
    }),
    [debouncedQuery, activeFilter]
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
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
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
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
      <ScreenHeader title="Tra cứu môn học" subtitle="Tìm kiếm và xem chi tiết môn học" />

      <View className="px-4 pt-2 pb-3">
        {/* Search bar */}
        <View className="flex-row items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 text-sm text-foreground placeholder:text-slate-400"
            placeholder="Tìm theo mã hoặc tên môn..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* Filter chips */}
        <FlatList
          horizontal
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          className="mt-3 -mx-4 px-4"
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActiveFilter(item.key)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityState={{ selected: activeFilter === item.key }}
              className={`px-3.5 py-2.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === item.key
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {item.label}
            </Pressable>
          )}
        />
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
            onRefresh={async () => { await refetch(); }}
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
              <MaterialCommunityIcons name="book-search-outline" size={48} color="#CBD5E1" />
              <Text className="text-slate-400 mt-3 text-sm">
                Không tìm thấy môn học nào.
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
        <View className="absolute inset-0 items-center justify-center bg-slate-50/60 dark:bg-slate-900/60">
          <ActivityIndicator color="#F36F21" size="large" />
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-slate-50/80 dark:bg-slate-900/80">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 mt-3">Không tải được danh sách môn học.</Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 px-6 py-3 bg-primary rounded-xl"
          >
            <Text className="text-white text-sm font-semibold">Thử lại</Text>
          </Pressable>
        </View>
      )}

      {/* Course detail sheet */}
      <CourseDetailSheetWrapper courseId={selectedCourseId} onClose={handleCloseDetail} />
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
  const catConfig = CATEGORY_CONFIG[course.category];

  const iconMap: Record<CourseCategory, any> = {
    CORE:       "book-open-page-variant",
    ELECTIVE:   "layers-triple",
    PRACTICUM:  "flask",
    PROJECT:    "school",
    FUNDAMENTAL:"alphabetical",
    OTHER:      "book",
  };
  const iconName = iconMap[course.category];

  return (
    <Pressable
      onPress={() => onPress(course)}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
    >
      <View className="flex-row items-start gap-3">
        {/* Category indicator */}
        <View
          className="h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: catConfig.bgColor }}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color={catConfig.color}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
            {course.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-muted-foreground font-mono">{course.code}</Text>
            <Text className="text-xs text-slate-300">·</Text>
            <Text className="text-xs text-muted-foreground">{course.credits} tín chỉ</Text>
          </View>
        </View>

        {/* Category badge */}
        <Badge
          variant={categoryBadgeVariant(course.category)}
          className="px-2 py-0.5"
        >
          {catConfig.label}
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

function CourseDetailSheetWrapper({ courseId, onClose }: CourseDetailSheetWrapperProps) {
  const { data: course, isLoading } = useCourseDetail(courseId);

  return (
    <Sheet open={!!courseId} onClose={onClose}>
      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#F36F21" />
        </View>
      ) : course ? (
        <CourseDetailView course={course} />
      ) : (
        <View className="items-center py-8">
          <Text className="text-muted-foreground">Không tìm được thông tin môn học.</Text>
        </View>
      )}
    </Sheet>
  );
}

function CourseDetailView({ course }: { course: NonNullable<Awaited<ReturnType<typeof useCourseDetail>>["data"]> }) {
  const catConfig = CATEGORY_CONFIG[course.category];

  const iconMap: Record<CourseCategory, any> = {
    CORE:       "book-open-page-variant",
    ELECTIVE:   "layers-triple",
    PRACTICUM:  "flask",
    PROJECT:    "school",
    FUNDAMENTAL:"alphabetical",
    OTHER:      "book",
  };
  const iconName = iconMap[course.category];

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-start gap-3 mb-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: catConfig.bgColor }}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={24}
            color={catConfig.color}
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
            {course.name}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5 font-mono">
            {course.code} · {course.credits} tín chỉ
          </Text>
        </View>
        <Badge variant={categoryBadgeVariant(course.category)}>
          {catConfig.label}
        </Badge>
      </View>

      <Separator className="my-3" />

      {/* Description */}
      {course.description && (
        <>
          <Text className="text-sm font-semibold text-foreground mb-1">Mô tả</Text>
          <Text className="text-sm text-muted-foreground mb-3">{course.description}</Text>
        </>
      )}

      {/* Objectives */}
      {course.objectives && (
        <>
          <Text className="text-sm font-semibold text-foreground mb-1">Mục tiêu</Text>
          <Text className="text-sm text-muted-foreground mb-3">{course.objectives}</Text>
        </>
      )}

      {/* Learning Outcomes */}
      {course.learning_outcomes && (
        <>
          <Text className="text-sm font-semibold text-foreground mb-1">Kết quả học tập</Text>
          <Text className="text-sm text-muted-foreground mb-3">{course.learning_outcomes}</Text>
        </>
      )}

      <Separator className="my-3" />

      {/* Prerequisites */}
      <Text className="text-sm font-semibold text-foreground mb-2">
        Điều kiện tiên quyết
      </Text>
      {course.prerequisites.length === 0 ? (
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
          <Text className="text-sm text-emerald-600">Không có môn tiên quyết.</Text>
        </View>
      ) : (
        <View className="gap-2 mb-3">
          {course.prerequisites.map((prereq) => (
            <View
              key={prereq.id}
              className="flex-row items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2"
            >
              <MaterialCommunityIcons name="arrow-up" size={14} color="#64748B" />
              <Text className="text-sm text-foreground flex-1">
                {prereq.prerequisite_course.code} – {prereq.prerequisite_course.name}
              </Text>
              {prereq.minimum_score && (
                <Badge variant="secondary" className="px-1.5 py-0">
                  ≥ {prereq.minimum_score}
                </Badge>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Required by (next courses) */}
      {course.required_by.length > 0 && (
        <>
          <Text className="text-sm font-semibold text-foreground mb-2">
            Là điều kiện cho
          </Text>
          <View className="gap-2 mb-3">
            {course.required_by.map((next) => (
              <View
                key={next.id}
                className="flex-row items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2"
              >
                <MaterialCommunityIcons name="arrow-down" size={14} color="#F36F21" />
                <Text className="text-sm text-foreground flex-1">
                  {next.code} – {next.name}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Co-requisites */}
      {course.co_requisites.length > 0 && (
        <>
          <Text className="text-sm font-semibold text-foreground mb-2">
            Học cùng kỳ
          </Text>
          <View className="gap-2 mb-3">
            {course.co_requisites.map((co) => (
              <View
                key={co.id}
                className="flex-row items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2"
              >
                <MaterialCommunityIcons name="link-variant" size={14} color="#7C3AED" />
                <Text className="text-sm text-foreground flex-1">
                  {co.code} – {co.name}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function categoryBadgeVariant(
  category: CourseCategory
): "default" | "secondary" | "success" | "warning" | "destructive" {
  switch (category) {
    case "CORE":      return "default";
    case "ELECTIVE":  return "secondary";
    case "PRACTICUM": return "success";
    case "PROJECT":   return "warning";
    default:          return "secondary";
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
