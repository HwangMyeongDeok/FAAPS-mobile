/**
 * FE-S-4 — Course catalogue.
 * Container keeps data hooks; rows live in `src/modules/courses/`.
 */

import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyBlock, ErrorBlock } from "@/components/feedback";
import { useCourses } from "@/lib/queries/course";
import { CourseDetailSheet } from "@/modules/curriculum";
import { CourseListItem, useDebounce } from "@/modules/courses";
import type { Course } from "@/types/course";

export default function CoursesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const params = useMemo(
    () => ({ search: debouncedQuery || undefined, size: 20 }),
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

  const courses = useMemo(() => data?.pages.flatMap((p) => p) ?? [], [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCoursePress = useCallback((course: Course) => {
    setSelectedCourseId(course.id);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Course catalogue"
        subtitle="Search and explore every course in the catalogue"
      />

      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 dark:border-line-dark dark:bg-surface-dark">
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
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8} className="active:opacity-60">
              <MaterialCommunityIcons name="close-circle" size={18} color="#8B8178" />
            </Pressable>
          )}
        </View>
      </View>

      {isError && !isLoading ? (
        <View className="flex-1 px-4 pt-2">
          <ErrorBlock
            title="Could not load the course list"
            message="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor="#F36F21"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#F36F21" />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyBlock
                icon="book-search-outline"
                title="No courses found"
                message={
                  searchQuery
                    ? `Nothing matches "${searchQuery}". Try another code or name.`
                    : "The catalogue is empty right now."
                }
              />
            ) : undefined
          }
          renderItem={({ item }) => <CourseListItem course={item} onPress={handleCoursePress} />}
        />
      )}

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-ground/60 dark:bg-ground-dark/60">
          <ActivityIndicator color="#F36F21" size="large" />
        </View>
      )}

      <CourseDetailSheet courseId={selectedCourseId} onClose={() => setSelectedCourseId(null)} />
    </SafeAreaView>
  );
}
