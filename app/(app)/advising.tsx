/**
 * FE-S-5 — Advisor advising (1-on-1 chat).
 * Container keeps data hooks; visuals live in `src/modules/advising/`.
 */

import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Sheet } from "@/components/ui";
import { ErrorBlock, EmptyBlock, LoadingBlock } from "@/components/feedback";
import {
  useAdvisingRequests,
  useCreateAdvisingRequest,
} from "@/lib/queries/advisor";
import { useMyAdvisor } from "@/lib/queries/profile";
import { ORANGE } from "@/modules/advising/format";
import { ConversationRow } from "@/modules/advising/components/ConversationRow";
import { Thread } from "@/modules/advising/components/Thread";
import { NewRequestSheet } from "@/modules/advising/components/NewRequestSheet";

export default function AdvisingScreen() {
  const { conversation } = useLocalSearchParams<{ conversation?: string }>();
  const { data: advisor } = useMyAdvisor();

  const [activeId, setActiveId] = useState<string | null>(conversation ?? null);
  const [lastLink, setLastLink] = useState(conversation);
  if (conversation !== lastLink) {
    setLastLink(conversation);
    setActiveId(conversation ?? null);
  }

  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: conversations = [], isLoading, isError, refetch, isRefetching } = useAdvisingRequests();
  const isDark = useColorScheme() === "dark";
  const createRequest = useCreateAdvisingRequest();

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const onCreate = () => {
    const title = subject.trim();
    const body = content.trim();
    if (title.length < 5) {
      setFormError("The subject must be at least 5 characters.");
      return;
    }
    if (body.length < 10) {
      setFormError("Describe your question in at least 10 characters so the advisor can help faster.");
      return;
    }
    setFormError(null);
    createRequest.mutate(
      { title, description: body },
      {
        onSuccess: (created) => {
          setActiveId(created.id);
          setComposing(false);
          setSubject("");
          setContent("");
          setFormError(null);
        },
      },
    );
  };

  if (active) {
    return (
      <Thread
        request={active}
        onBack={() => {
          setActiveId(null);
          if (conversation) router.setParams({ conversation: undefined });
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Advising"
        subtitle="Talk directly to your assigned advisor"
        onBack={goBack}
        right={
          <Pressable
            onPress={() => {
              setFormError(null);
              setComposing(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Create a new advising request"
            className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2.5 active:opacity-80 active:scale-95"
            style={{ backgroundColor: ORANGE }}
          >
            <MaterialCommunityIcons name="plus" size={15} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white">New request</Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="flex-1 px-5 pt-6">
          <LoadingBlock message="Loading your conversations…" />
        </View>
      ) : isError ? (
        <View className="flex-1 px-5 pt-6">
          <ErrorBlock
            title="Could not load conversations"
            message="Check your connection and pull down to try again."
            onRetry={() => refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          ItemSeparatorComponent={() => <View className="h-px bg-rule dark:bg-rule-dark" />}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListEmptyComponent={
            <View className="pt-6">
              <EmptyBlock
                icon="message-text-outline"
                title="No conversations yet"
                message="When your advisor replies to a question, the conversation shows up here."
                actionLabel="Create a request"
                onAction={() => {
                  setFormError(null);
                  setComposing(true);
                }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <ConversationRow conversation={item} onPress={() => setActiveId(item.id)} />
          )}
        />
      )}

      <Sheet
        open={composing}
        onClose={() => {
          setComposing(false);
          setFormError(null);
        }}
        maxHeightRatio={0.9}
        className="rounded-t-3xl"
      >
        <NewRequestSheet
          subject={subject}
          content={content}
          error={formError}
          isDark={isDark}
          advisorName={advisor?.fullName ?? "Your advisor"}
          pending={createRequest.isPending}
          onSubject={setSubject}
          onContent={setContent}
          onSubmit={onCreate}
        />
      </Sheet>
    </SafeAreaView>
  );
}
