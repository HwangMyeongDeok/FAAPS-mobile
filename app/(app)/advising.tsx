/**
 * FE-S-5 — Advisor advising (1-on-1 chat).
 * Container keeps data hooks; visuals live in `src/modules/advising/`.
 */

import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Plus } from "lucide-react-native";
import { useLocalSearchParams, router } from "expo-router";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Sheet } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBlock, LoadingBlock } from "@/components/feedback";
import {
  useAdvisingRequests,
  useAdvisorAssignment,
  useCreateAdvisingRequest,
  useRequestAdvisorAssignment,
} from "@/lib/queries/advisor";
import { useMyAdvisor } from "@/lib/queries/profile";
import { ORANGE } from "@/modules/advising/format";
import { AdvisorAssignmentCard } from "@/modules/advising/components/AdvisorAssignmentCard";
import { ConversationRow } from "@/modules/advising/components/ConversationRow";
import { Thread } from "@/modules/advising/components/Thread";
import { NewRequestSheet } from "@/modules/advising/components/NewRequestSheet";

export default function AdvisingScreen() {
  const { conversation } = useLocalSearchParams<{ conversation?: string }>();
  const { data: advisor, refetch: refetchAdvisor } = useMyAdvisor();

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

  // Advisor assignment — the student may not have an advisor yet, in which
  // case the screen offers a way to ask the academic office for one.
  const {
    data: assignment,
    isError: assignmentError,
    refetch: refetchAssignment,
  } = useAdvisorAssignment();
  const requestAdvisor = useRequestAdvisorAssignment();
  const [assignmentErrorText, setAssignmentErrorText] = useState<string | null>(null);

  const hasAdvisor = !!advisor;
  const pendingRequest = !!assignment?.pendingRequestId;

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

  const onRequestAdvisor = () => {
    setAssignmentErrorText(null);
    requestAdvisor.mutate(undefined, {
      onSuccess: () => {
        // The backend answers 409 when the student already has an advisor —
        // refetch so the card settles on the real state either way.
        refetchAssignment();
        refetchAdvisor();
      },
      onError: (error) => {
        setAssignmentErrorText(
          error instanceof Error
            ? error.message
            : "Không thể gửi yêu cầu. Vui lòng thử lại.",
        );
        refetchAssignment();
      },
    });
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
        title="Cố vấn học tập"
        subtitle="Trao đổi trực tiếp với cố vấn của bạn"
        onBack={goBack}
        right={
          <Pressable
            onPress={() => {
              setFormError(null);
              setComposing(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Tạo yêu cầu tư vấn mới"
            className="flex-row items-center gap-1.5 rounded-xl px-3.5 py-2.5 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <Plus size={15} color="#FFFFFF" />
            <Text className="text-xs" style={{ color: "#FFFFFF", fontWeight: "700" }}>
              Yêu cầu mới
            </Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="flex-1 px-5 pt-6">
          <LoadingBlock message="Đang tải hội thoại…" />
        </View>
      ) : isError ? (
        <View className="flex-1 px-5 pt-6">
          <ErrorBlock
            title="Không tải được hội thoại"
            message="Kiểm tra kết nối rồi kéo xuống để thử lại."
            onRetry={() => refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListHeaderComponent={
            // Chưa có cố vấn → mời sinh viên gửi yêu cầu phân công.
            hasAdvisor || assignmentError ? undefined : (
              <View className="mb-4">
                <AdvisorAssignmentCard
                  hasAdvisor={hasAdvisor}
                  pending={pendingRequest}
                  submitting={requestAdvisor.isPending}
                  error={assignmentErrorText}
                  isDark={isDark}
                  onRequest={onRequestAdvisor}
                />
              </View>
            )
          }
          ListEmptyComponent={
            hasAdvisor ? (
              <View className="pt-10">
                <EmptyState
                  muted
                  icon={<MessageCircle size={26} color="#9CA3AF" />}
                  title="Chưa có hội thoại nào"
                  message="Khi cố vấn trả lời câu hỏi của bạn, cuộc trò chuyện sẽ xuất hiện ở đây."
                  actionLabel="Tạo yêu cầu"
                  onAction={() => {
                    setFormError(null);
                    setComposing(true);
                  }}
                />
              </View>
            ) : undefined
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
