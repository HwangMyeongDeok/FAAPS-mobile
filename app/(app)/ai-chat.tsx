/**
 * FE-S-9 — AI Academic Assistant (chat).
 * Container keeps data hooks; visuals live in `src/modules/ai/components/`.
 *
 * GAP-5: không tự dính vào conversations[0]. Lần đầu vào app (chưa chọn
 * conversation) hiển thị empty state "Bắt đầu trò chuyện mới với AI".
 * Nút Menu ở header mở ConversationDrawer để tạo/switch conversation.
 * Gửi tin nhắn lần đầu mà chưa có conversation → tự tạo mới trước khi gửi.
 *
 * DESIGN:
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Card bo 16px, shadow 0 1px 3px rgba(0,0,0,0.05). Button bo 12px.
 * - Bubble user cam/trắng góc phải, AI xám #F3F4F6 góc trái (xem chat.tsx).
 * - Input bottom sticky: TextInput bo 24px, nút Send tròn cam 48px.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Menu } from "lucide-react-native";
import { router } from "expo-router";

import { goBack } from "@/components/ScreenHeader";
import {
  useAiConversations,
  useAiMessages,
  useCreateAiConversation,
  useRateAiMessage,
  useSendAiMessage,
} from "@/lib/queries/ai";
import { AI_PROMPT_SUGGESTIONS } from "@/lib/api/ai";
import type { AiChatMessage } from "@/types/ai";
import { ORANGE, ORANGE_DEEP } from "@/modules/ai/format";
import {
  EmptyChatState,
  MessageBlock,
  TypingIndicator,
} from "@/modules/ai/components/chat";
import { ConversationDrawer } from "@/modules/ai/components/ConversationDrawer";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

export default function AiChatScreen() {
  const isDark = useColorScheme() === "dark";

  const { data: conversations = [] } = useAiConversations();
  const createConversation = useCreateAiConversation();

  // GAP-5: không tự chọn conversations[0] — để null để hiện empty state.
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: serverMessages = [], isLoading } = useAiMessages(conversationId);
  const send = useSendAiMessage();
  const rate = useRateAiMessage();

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<ScrollViewInstance>(null);
  const isThinking = send.isPending;

  const [syncedThread, setSyncedThread] = useState(serverMessages);
  if (syncedThread !== serverMessages) {
    setSyncedThread(serverMessages);
    setMessages(serverMessages);
  }

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, isThinking, scrollToEnd]);

  const activeTitle = useMemo(
    () => conversations.find((c) => c.id === conversationId)?.title ?? null,
    [conversations, conversationId],
  );

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const created = await createConversation.mutateAsync();
    setConversationId(created.id);
    return created.id;
  }, [conversationId, createConversation]);

  /** Tạo đoạn chat mới từ Drawer. */
  const onNewConversation = useCallback(async () => {
    try {
      const created = await createConversation.mutateAsync();
      setConversationId(created.id);
      setMessages([]);
      setDrawerOpen(false);
    } catch {
      // createConversation đã surface lỗi qua React Query; giữ drawer mở
      // để user bấm lại thay vì crash.
    }
  }, [createConversation]);

  /** Switch conversation từ Drawer: đóng drawer, thread sync theo query. */
  const onSelectConversation = useCallback((id: string) => {
    setConversationId(id);
    setMessages([]);
    setDrawerOpen(false);
  }, []);

  const onSend = useCallback(
    async (question: string) => {
      const content = question.trim();
      if (!content || isThinking) return;

      const userMessage: AiChatMessage = {
        id: `local-${Date.now()}`,
        conversationId: conversationId ?? "",
        sender: "USER",
        content,
        questionCategory: null,
        isUnsupported: false,
        isFallback: false,
        confidenceScore: null,
        sources: [],
        wasHelpful: null,
        feedback: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setDraft("");
      scrollToEnd();

      try {
        // Chưa có conversation → tạo mới trước khi gửi.
        const id = await ensureConversation();
        const answer = await send.mutateAsync({ conversationId: id, content });
        setMessages((prev) => [...prev, answer.assistantMessage]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            conversationId: conversationId ?? "",
            sender: "ASSISTANT",
            content:
              "Không gửi được câu hỏi lúc này. Kiểm tra kết nối mạng rồi thử lại.",
            questionCategory: null,
            isUnsupported: false,
            isFallback: true,
            confidenceScore: null,
            sources: [],
            wasHelpful: null,
            feedback: null,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      scrollToEnd();
    },
    [conversationId, ensureConversation, isThinking, scrollToEnd, send],
  );

  const onRate = useCallback(
    (messageId: string, wasHelpful: boolean) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, wasHelpful } : m)),
      );
      rate.mutate({ messageId, wasHelpful });
    },
    [rate],
  );

  const toggleSources = useCallback((messageId: string) => {
    setExpandedSources((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  }, []);

  const showSuggestions = useMemo(
    () => conversationId === null || messages.length === 0,
    [conversationId, messages.length],
  );

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      {/* Header */}
      <View className="border-b border-line bg-surface px-4 pb-3 pt-2 dark:border-line-dark dark:bg-surface-dark">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            className="-ml-1 h-10 w-10 items-center justify-center rounded-full active:opacity-70 active:scale-95"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color={isDark ? "#F7F2EC" : INK}
            />
          </Pressable>

          {/* Nút menu → mở Drawer hội thoại */}
          <Pressable
            onPress={() => setDrawerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Mở danh sách cuộc trò chuyện"
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70 active:scale-95"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
          >
            <Menu size={20} color={isDark ? "#FFA371" : ORANGE_DEEP} />
          </Pressable>

          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: FPT_ORANGE }}
          >
            <MaterialCommunityIcons name="school-outline" size={19} color="#FFFFFF" />
          </View>

          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="text-[17px] font-bold text-ink dark:text-ink-dark"
              numberOfLines={1}
            >
              AI Academic Assistant
            </Text>
            <Text
              className="text-[11px] text-ink-muted dark:text-ink-muted-dark"
              numberOfLines={1}
            >
              {activeTitle ?? "Grounded in your curriculum · with citations"}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/(app)/ai-roadmap")}
            accessibilityRole="button"
            accessibilityLabel="View the AI study roadmap"
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70 active:scale-95"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
          >
            <MaterialCommunityIcons
              name="map-marker-path"
              size={20}
              color={isDark ? "#FFA371" : ORANGE_DEEP}
            />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 }}
        >
          {isLoading && messages.length === 0 && conversationId !== null ? (
            <View className="gap-4 pt-2">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="flex-row gap-2.5"
                  style={{ alignSelf: i % 2 === 0 ? "flex-start" : "flex-end" }}
                >
                  <View
                    className="h-16 rounded-2xl bg-raised dark:bg-raised-dark"
                    style={{ width: i % 2 === 0 ? "72%" : "48%" }}
                  />
                </View>
              ))}
            </View>
          ) : messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            messages.map((message) => (
              <MessageBlock
                key={message.id}
                message={message}
                isDark={isDark}
                sourcesOpen={expandedSources[message.id] ?? false}
                onToggleSources={() => toggleSources(message.id)}
                onRate={onRate}
              />
            ))
          )}

          {isThinking ? <TypingIndicator isDark={isDark} /> : null}

          {showSuggestions && !isThinking ? (
            <View className="mt-5">
              <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                Bạn có thể hỏi
              </Text>
              <View className="mt-2.5 gap-2">
                {AI_PROMPT_SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => onSend(s.prompt)}
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                    className="flex-row items-center gap-2.5 border border-line bg-surface px-4 py-3.5 active:opacity-70 active:scale-[0.99] dark:border-line-dark dark:bg-surface-dark"
                    style={{
                      borderRadius: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 1,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="arrow-top-left"
                      size={16}
                      color={isDark ? "#FFA371" : ORANGE}
                    />
                    <Text className="flex-1 text-[14px] font-semibold text-ink dark:text-ink-dark">
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {messages.length > 0 ? (
            <Text className="mt-6 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
              AI có thể mắc lỗi. Hãy kiểm tra nguồn trích dẫn trước khi đăng ký môn học.
            </Text>
          ) : null}
        </ScrollView>

        {/* Input area — bottom sticky, TextInput bo 24px, nút Send tròn cam */}
        <View
          className="border-t border-line bg-surface px-4 pb-3 pt-3 dark:border-line-dark dark:bg-surface-dark"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="flex-row items-end gap-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Hỏi về chương trình học của bạn…"
              placeholderTextColor={isDark ? "#7D746C" : MUTED}
              multiline
              editable={!isThinking}
              returnKeyType="send"
              onSubmitEditing={() => onSend(draft)}
              accessibilityLabel="Nhập câu hỏi cho trợ lý AI"
              className="max-h-[120px] flex-1 px-4 py-3 text-[14px] leading-5 text-ink dark:text-ink-dark"
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: isDark ? "#302A24" : "#E5E0D8",
                backgroundColor: isDark ? "#121212" : "#FAFAFA",
                minHeight: 48,
              }}
            />
            <Pressable
              onPress={() => onSend(draft)}
              disabled={!draft.trim() || isThinking}
              accessibilityRole="button"
              accessibilityLabel="Gửi câu hỏi"
              className="items-center justify-center active:opacity-80 active:scale-95"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: draft.trim() ? FPT_ORANGE : isDark ? "#302A24" : "#E4DCD3",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              {isThinking ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Drawer danh sách hội thoại */}
      <ConversationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversations={conversations}
        activeId={conversationId}
        creating={createConversation.isPending}
        onNew={onNewConversation}
        onSelect={onSelectConversation}
      />
    </SafeAreaView>
  );
}
