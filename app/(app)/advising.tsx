/**
 * FE-S-5 — Advisor advising / 1-1 chat.
 *
 * The screen answers one question: "Advisor của tôi đã nói gì?"
 * It is an inbox first and a thread second: the conversation list is the
 * default view, and opening one replaces it with the thread so the user
 * never has to navigate through two levels on a phone.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Sheet } from "@/components/ui";
import {
  useAdvisors,
  useConversations,
  useCreateAdvisingRequest,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/lib/queries/advisor";
import { useMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";
import type { Conversation, Message } from "@/lib/db/mockDb";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function AdvisingScreen() {
  const { conversation } = useLocalSearchParams<{ conversation?: string }>();
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const { data: profile } = useMyProfile(userId);
  const { data: advisors = [] } = useAdvisors();

  // `activeId` is `null` when the user closed a thread, and follows the deep
  // link otherwise. Adjusting it during render (rather than in an effect)
  // keeps the deep link and the local choice in sync without a second render.
  const [activeId, setActiveId] = useState<string | null>(conversation ?? null);
  const [lastLink, setLastLink] = useState(conversation);
  if (conversation !== lastLink) {
    setLastLink(conversation);
    setActiveId(conversation ?? null);
  }

  // The conversation just created by the student. It is kept here as well as
  // in the mock DB so the screen can open the thread immediately, without
  // waiting for the conversation list to refetch.
  const [freshConversation, setFreshConversation] = useState<Conversation | null>(null);

  // The composer sheet for a new advising request.
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useConversations();
  const isDark = useColorScheme() === "dark";

  const createRequest = useCreateAdvisingRequest();

  // A deep link may land on a conversation that is not the first one.
  const active = useMemo(() => {
    const fromList = conversations.find((c) => c.id === activeId);
    if (fromList) return fromList;
    // The freshly created conversation is not in the list yet.
    if (freshConversation && freshConversation.id === activeId) return freshConversation;
    return null;
  }, [conversations, activeId, freshConversation]);

  // The advisor the request goes to: the assigned one, else the first in
  // the directory, else the demo default.
  const advisorId =
    profile?.advisor?.user.id ?? advisors[0]?.user.id ?? "u-advisor-1";

  const onCreate = () => {
    const title = subject.trim();
    const body = content.trim();
    if (!userId) return;
    if (title.length < 5) {
      setFormError("Chủ đề phải có ít nhất 5 ký tự.");
      return;
    }
    if (body.length < 10) {
      setFormError("Viết rõ nội dung câu hỏi (ít nhất 10 ký tự) để cố vấn hỗ trợ nhanh hơn.");
      return;
    }
    setFormError(null);

    createRequest.mutate(
      { student_id: userId, advisor_id: advisorId, subject: title, content: body },
      {
        onSuccess: (created) => {
          setFreshConversation(created);
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
        conversation={active}
        onBack={() => {
          setActiveId(null);
          setFreshConversation(null);
          // Drop the query param too, so a reload lands on the inbox
          // instead of reopening the thread.
          if (conversation) router.setParams({ conversation: undefined });
        }}
      />
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScreenHeader
        title="Tư vấn cố vấn"
        subtitle="Trao đổi trực tiếp với advisor được phân công"
        onBack={goBack}
        right={
          <Pressable
            onPress={() => {
              setFormError(null);
              setComposing(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Tạo yêu cầu tư vấn mới"
            className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2.5 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <MaterialCommunityIcons name="plus" size={15} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white">Yêu cầu mới</Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ORANGE} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={40}
            color="#CBD5E1"
          />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Không tải được hội thoại. Kéo xuống để thử lại.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-rule dark:bg-rule-dark" />
          )}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListEmptyComponent={
            <View className="items-center px-8 pt-16">
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={26}
                  color={isDark ? "#FFA371" : ORANGE_DEEP}
                />
              </View>
              <Text className="mt-4 text-center text-sm font-semibold text-ink dark:text-ink-dark">
                Chưa có hội thoại nào
              </Text>
              <Text className="mt-1 text-center text-xs text-ink-muted dark:text-ink-muted-dark">
                Khi advisor phản hồi câu hỏi của bạn, cuộc trò chuyện sẽ xuất
                hiện ở đây.
              </Text>
              <Pressable
                onPress={() => {
                  setFormError(null);
                  setComposing(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Tạo yêu cầu tư vấn mới"
                className="mt-5 flex-row items-center gap-2 rounded-full px-5 py-3 active:opacity-85"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="plus" size={17} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white">
                  Tạo yêu cầu tư vấn
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() => setActiveId(item.id)}
            />
          )}
        />
      )}

      {/* ── New advising request sheet ── */}
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
          advisorName={profile?.advisor?.user.full_name ?? "Cố vấn của bạn"}
          pending={createRequest.isPending}
          onSubject={setSubject}
          onContent={setContent}
          onSubmit={onCreate}
        />
      </Sheet>
    </SafeAreaView>
  );
}

// ── Conversation row ─────────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const unread = conversation.unread_count > 0;
  const isDark = useColorScheme() === "dark";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={conversation.subject}
      className="flex-row items-center gap-3 py-4 active:opacity-70"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: unread
            ? isDark
              ? "#2E1C0E"
              : "#FFE5D4"
            : isDark
              ? "#241F1B"
              : "#F2EDE7",
        }}
      >
        <MaterialCommunityIcons
          name="message-text-outline"
          size={20}
          color={unread ? (isDark ? "#FFA371" : ORANGE_DEEP) : isDark ? "#7D746C" : "#8B8178"}
        />
      </View>
      <View className="flex-1">
        <Text
          className="text-[15px] leading-5 text-ink dark:text-ink-dark"
          style={unread ? { fontWeight: "700" } : undefined}
          numberOfLines={1}
        >
          {conversation.subject}
        </Text>
        <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          {conversation.status === "archived" ? "Đã lưu trữ · " : ""}
          {timeAgo(conversation.last_message_at)}
        </Text>
      </View>
      {unread ? (
        <View
          className="min-h-[22px] min-w-[22px] items-center justify-center rounded-full px-1"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-[11px] font-bold text-white tabular-nums">
            {conversation.unread_count}
          </Text>
        </View>
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={isDark ? "#4A423B" : "#C3B8AD"}
        />
      )}
    </Pressable>
  );
}

// ── Thread ───────────────────────────────────────────────────────────────────

function Thread({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const { data: messages = [], isLoading } = useMessages(conversation.id);
  const send = useSendMessage(conversation.id);
  const markRead = useMarkConversationRead(conversation.id);
  const { data: advisors = [] } = useAdvisors();
  const [draft, setDraft] = useState("");
  const isDark = useColorScheme() === "dark";

  const advisor = useMemo(
    () => advisors.find((a) => a.user.id === conversation.advisor_id) ?? null,
    [advisors, conversation.advisor_id]
  );

  // Opening a thread clears its unread badge exactly once per conversation.
  useEffect(() => {
    if (conversation.unread_count > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const onSend = () => {
    const content = draft.trim();
    if (!content || send.isPending) return;
    setDraft("");
    send.mutate(content, {
      onError: () => setDraft(content),
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScreenHeader
        title={conversation.subject}
        subtitle={
          advisor
            ? `${advisor.user.full_name} · ${advisor.advisor.advisor_code}`
            : "Tư vấn cố vấn"
        }
        onBack={onBack}
        right={
          advisor ? (
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4" }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
              >
                {initials(advisor.user.full_name)}
              </Text>
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={ORANGE} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            inverted
            contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
            ListEmptyComponent={
              <View className="items-center px-8 pt-16">
                <Text className="text-center text-sm text-ink-muted dark:text-ink-muted-dark">
                  Chưa có tin nhắn nào trong cuộc trò chuyện này.
                </Text>
              </View>
            }
            renderItem={({ item }) => <Bubble message={item} />}
          />
        )}

        {/* Composer */}
        <View className="flex-row items-end gap-2 border-t border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Nhắn cho advisor..."
            placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
            multiline
            editable={!send.isPending}
            className="max-h-[120px] flex-1 rounded-2xl border border-line px-4 py-3 text-sm text-ink dark:border-line-dark dark:text-ink-dark"
            style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
          />
          <Pressable
            onPress={onSend}
            disabled={!draft.trim() || send.isPending}
            accessibilityRole="button"
            accessibilityLabel="Gửi tin nhắn"
            className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
            style={{
              backgroundColor: draft.trim() ? ORANGE : isDark ? "#302A24" : "#E4DCD3",
            }}
          >
            {send.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ message }: { message: Message }) {
  const mine = message.role === "student";
  const isDark = useColorScheme() === "dark";
  return (
    <View
      className={`mb-2 flex-row ${mine ? "justify-end" : "justify-start"}`}
    >
      <View
        className="max-w-[82%] rounded-2xl px-4 py-3"
        style={
          mine
            ? { backgroundColor: ORANGE, borderBottomRightRadius: 6 }
            : {
                backgroundColor: isDark ? "#1B1815" : "#FFFFFF",
                borderBottomLeftRadius: 6,
                borderWidth: 1,
                borderColor: isDark ? "#302A24" : "#EAE1D8",
              }
        }
      >
        <Text
          className="text-[14px] leading-5"
          style={{ color: mine ? "#FFFFFF" : isDark ? "#F7F2EC" : "#191512" }}
        >
          {message.content}
        </Text>
        <Text
          className="mt-1 text-[10px]"
          style={{
            color: mine ? "rgba(255,255,255,0.78)" : isDark ? "#7D746C" : "#8B8178",
            textAlign: mine ? "right" : "left",
          }}
        >
          {timeAgo(message.sent_at)}
        </Text>
      </View>
    </View>
  );
}

// ── New advising request sheet ───────────────────────────────────────────────

/**
 * The composer for a new advising request.
 *
 * A request IS a conversation: the subject becomes the thread title and the
 * body becomes its first message. So the form is deliberately short — one
 * title, one question — and the advisor is named at the top so the student
 * knows who they are writing to before they send.
 */
function NewRequestSheet({
  subject,
  content,
  error,
  isDark,
  advisorName,
  pending,
  onSubject,
  onContent,
  onSubmit,
}: {
  subject: string;
  content: string;
  error: string | null;
  isDark: boolean;
  advisorName: string;
  pending: boolean;
  onSubject: (v: string) => void;
  onContent: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: ORANGE }}
        >
          <MaterialCommunityIcons name="message-plus-outline" size={22} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink dark:text-ink-dark">
            Yêu cầu tư vấn mới
          </Text>
          <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
            Gửi tới {advisorName}
          </Text>
        </View>
      </View>

      {/* Subject */}
      <Text className="mb-1.5 mt-5 text-sm font-bold text-ink dark:text-ink-dark">
        Chủ đề <Text style={{ color: ORANGE }}>*</Text>
      </Text>
      <TextInput
        value={subject}
        onChangeText={onSubject}
        placeholder="VD: Xin tư vấn chọn môn cho kỳ 6"
        placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
        autoCapitalize="sentences"
        accessibilityLabel="Chủ đề yêu cầu tư vấn"
        className="rounded-2xl border border-line px-4 py-3 text-[14px] leading-5 text-ink dark:border-line-dark dark:text-ink-dark"
        style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
      />

      {/* Content */}
      <Text className="mb-1.5 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
        Nội dung câu hỏi <Text style={{ color: ORANGE }}>*</Text>
      </Text>
      <TextInput
        value={content}
        onChangeText={onContent}
        placeholder="Mô tả rõ bạn đang cần tư vấn gì, kèm ngữ cảnh (GPA hiện tại, môn đã học…)"
        placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        accessibilityLabel="Nội dung câu hỏi"
        className="min-h-[130px] rounded-2xl border border-line px-4 py-3 text-[14px] leading-5 text-ink dark:border-line-dark dark:text-ink-dark"
        style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
      />

      {error ? (
        <Text className="mt-1.5 text-xs font-semibold" style={{ color: "#DC2626" }}>
          {error}
        </Text>
      ) : (
        <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          Cố vấn sẽ phản hồi trong 1–2 ngày làm việc
        </Text>
      )}

      <Pressable
        onPress={onSubmit}
        disabled={pending}
        accessibilityRole="button"
        accessibilityLabel="Gửi yêu cầu tư vấn"
        className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
        style={{ backgroundColor: ORANGE, opacity: pending ? 0.7 : 1 }}
      >
        {pending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name="send" size={17} color="#FFFFFF" />
            <Text className="text-[15px] font-bold text-white">Gửi yêu cầu</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
