/**
 * FE-S-9 — AI Academic Assistant (chat).
 * Container keeps data hooks; visuals live in `src/modules/ai/components/chat.tsx`.
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

export default function AiChatScreen() {
  const isDark = useColorScheme() === "dark";

  const { data: conversations = [] } = useAiConversations();
  const createConversation = useCreateAiConversation();

  const [conversationId, setConversationId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );

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

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const created = await createConversation.mutateAsync();
    setConversationId(created.id);
    return created.id;
  }, [conversationId, createConversation]);

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
              "The question could not be sent right now. Check your connection and try again.",
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
    () => messages.length === 0 && AI_PROMPT_SUGGESTIONS.length > 0,
    [messages.length],
  );

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
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
              color={isDark ? "#F7F2EC" : "#191512"}
            />
          </Pressable>

          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: ORANGE }}
          >
            <MaterialCommunityIcons name="school-outline" size={19} color="#FFFFFF" />
          </View>

          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="text-[17px] font-bold text-ink dark:text-ink-dark"
            >
              AI Academic Assistant
            </Text>
            <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
              Grounded in your curriculum · with citations
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
          {isLoading && messages.length === 0 ? (
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
                You can ask
              </Text>
              <View className="mt-2.5 gap-2">
                {AI_PROMPT_SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => onSend(s.prompt)}
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                    className="flex-row items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5 active:opacity-70 active:scale-[0.99] dark:border-line-dark dark:bg-surface-dark"
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
              The AI can make mistakes. Check the cited sources before you register for courses.
            </Text>
          ) : null}
        </ScrollView>

        <View className="border-t border-line bg-surface px-4 pb-3 pt-3 dark:border-line-dark dark:bg-surface-dark">
          <View className="flex-row items-end gap-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask about your programme…"
              placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
              multiline
              editable={!isThinking}
              returnKeyType="send"
              onSubmitEditing={() => onSend(draft)}
              accessibilityLabel="Type your question for the AI assistant"
              className="max-h-[120px] flex-1 rounded-2xl border border-line px-4 py-3 text-[14px] leading-5 text-ink dark:border-line-dark dark:text-ink-dark"
              style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
            />
            <Pressable
              onPress={() => onSend(draft)}
              disabled={!draft.trim() || isThinking}
              accessibilityRole="button"
              accessibilityLabel="Send the question"
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-80 active:scale-95"
              style={{
                backgroundColor: draft.trim() ? ORANGE : isDark ? "#302A24" : "#E4DCD3",
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
    </SafeAreaView>
  );
}
