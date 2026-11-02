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
import {
  useAdvisors,
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/lib/queries/advisor";
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

  // `activeId` is `null` when the user closed a thread, and follows the deep
  // link otherwise. Adjusting it during render (rather than in an effect)
  // keeps the deep link and the local choice in sync without a second render.
  const [activeId, setActiveId] = useState<string | null>(conversation ?? null);
  const [lastLink, setLastLink] = useState(conversation);
  if (conversation !== lastLink) {
    setLastLink(conversation);
    setActiveId(conversation ?? null);
  }

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useConversations();
  const isDark = useColorScheme() === "dark";

  // A deep link may land on a conversation that is not the first one.
  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  if (active) {
    return (
      <Thread
        conversation={active}
        onBack={() => {
          setActiveId(null);
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
