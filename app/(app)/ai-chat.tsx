/**
 * FE-S-9 — Trợ lý học tập AI (AI Academic Assistant · chat).
 *
 * ── Direction ───────────────────────────────────────────────────────────────
 * Style: framed-sheet (app), mapped onto the FPT brand tokens already in
 * `tailwind.config.js`. The move survives: one warm ground, white work
 * surfaces with a single hairline edge, no shadows at rest, one orange
 * reserved for the data and the single primary action.
 *
 * The screen's one question: "AI nói gì về chương trình của tôi, và tôi
 * tin nó dựa trên tài liệu nào?" — so the biggest thing after the title is
 * the answer, and every answer carries its sources.
 *
 * ── Design notes ────────────────────────────────────────────────────────────
 * • One accent hue (FPT orange #F36F21). Colour appears on the assistant's
 *   avatar, the send button and the selected rating — never as decoration.
 * • The student speaks on the right in brand orange; the assistant speaks on
 *   the left on white. That is the only structural difference between the
 *   two sides, so the thread reads at a glance.
 * • Sources are the trust surface: numbered badges that expand into the
 *   actual document, the clause, and the line the answer leaned on.
 * • No gradients, no glass, no emoji, no icon in a tinted square.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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
import { useAiPrompts, useAiThread, useRateAiMessage, useSendAiMessage } from "@/lib/queries/ai";
import { useAuthStore } from "@/stores/auth";
import type { AiChatMessage, AiSource } from "@/types/ai";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

/** Label for each kind of cited document. */
const SOURCE_KIND_LABEL: Record<AiSource["kind"], string> = {
  curriculum: "Chương trình khung",
  syllabus: "Syllabus",
  regulation: "Quy chế",
  advisor: "Cố vấn",
};

export default function AiChatScreen() {
  const isDark = useColorScheme() === "dark";
  const userId = useAuthStore((s) => s.session?.user.id ?? null);

  const { data: thread, isLoading } = useAiThread(userId);
  const { data: suggestions = [] } = useAiPrompts();
  const send = useSendAiMessage(userId);
  const rate = useRateAiMessage(userId);

  // The live thread. Seeded from the server thread, then owned by this
  // screen so a sent message appears instantly. The seed is applied during
  // render (the "adjust state when a prop changes" pattern) rather than in
  // an effect, so the first paint is never an empty thread.
  const [seedThread, setSeedThread] = useState(thread);
  const [messages, setMessages] = useState<AiChatMessage[]>(thread?.messages ?? []);
  const [draft, setDraft] = useState("");
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<ScrollViewInstance>(null);
  const isThinking = send.isPending;

  if (thread && thread !== seedThread) {
    setSeedThread(thread);
    setMessages(thread.messages);
  }

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, isThinking, scrollToEnd]);

  const onSend = useCallback(
    (question: string) => {
      const content = question.trim();
      if (!content || isThinking) return;

      const userMessage: AiChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content,
        sent_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setDraft("");
      scrollToEnd();

      send.mutate(content, {
        onSuccess: (answer) => {
          setMessages((prev) => [...prev, answer]);
          scrollToEnd();
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              content:
                "Không gửi được câu hỏi lúc này. Kiểm tra kết nối rồi thử lại nhé.",
              sent_at: new Date().toISOString(),
            },
          ]);
        },
      });
    },
    [isThinking, send, scrollToEnd],
  );

  const onRate = useCallback(
    (messageId: string, value: "up" | "down") => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating: value } : m)),
      );
      if (userId) rate.mutate({ messageId, rating: value });
    },
    [rate, userId],
  );

  const toggleSources = useCallback((messageId: string) => {
    setExpandedSources((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  }, []);

  const showSuggestions = useMemo(
    () => messages.length === 0 && suggestions.length > 0,
    [messages.length, suggestions.length],
  );

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View className="border-b border-line bg-surface px-4 pb-3 pt-2 dark:border-line-dark dark:bg-surface-dark">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={10}
            className="-ml-1 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
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
              Trợ lý học tập AI
            </Text>
            <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
              Trả lời theo chương trình K19 · có dẫn nguồn
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/(app)/ai-roadmap")}
            accessibilityRole="button"
            accessibilityLabel="Xem lộ trình AI gợi ý"
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        className="flex-1"
      >
        {/* ── Thread ────────────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 20,
          }}
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
            <EmptyState />
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

          {/* The typing indicator lives inside the thread, right after the
              last message, so it reads as the assistant answering. */}
          {isThinking ? <TypingIndicator isDark={isDark} /> : null}

          {/* Quick prompts, only before the first question. */}
          {showSuggestions && !isThinking ? (
            <View className="mt-5">
              <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                Bạn có thể hỏi
              </Text>
              <View className="mt-2.5 gap-2">
                {suggestions.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => onSend(s.prompt)}
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                    className="flex-row items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5 active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
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
              Trợ lý AI có thể nhầm. Kiểm tra nguồn trích dẫn trước khi đăng ký môn.
            </Text>
          ) : null}
        </ScrollView>

        {/* ── Composer ──────────────────────────────────────────────────── */}
        <View className="border-t border-line bg-surface px-4 pb-3 pt-3 dark:border-line-dark dark:bg-surface-dark">
          <View className="flex-row items-end gap-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Hỏi về chương trình học…"
              placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
              multiline
              editable={!isThinking}
              returnKeyType="send"
              onSubmitEditing={() => onSend(draft)}
              accessibilityLabel="Nhập câu hỏi cho trợ lý AI"
              className="max-h-[120px] flex-1 rounded-2xl border border-line px-4 py-3 text-[14px] leading-5 text-ink dark:border-line-dark dark:text-ink-dark"
              style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
            />
            <Pressable
              onPress={() => onSend(draft)}
              disabled={!draft.trim() || isThinking}
              accessibilityRole="button"
              accessibilityLabel="Gửi câu hỏi"
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
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

// ═══════════════════════════════════════════════════════════════════════════
// Pieces
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <View className="items-center px-4 pt-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-tint dark:bg-brand-tint-dark">
        <MaterialCommunityIcons name="robot-happy-outline" size={30} color={ORANGE_DEEP} />
      </View>
      <Text className="mt-4 text-center text-[15px] font-bold text-ink dark:text-ink-dark">
        Hỏi bất cứ điều gì về chương trình học
      </Text>
      <Text className="mt-1.5 text-center text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark">
        Trợ lý đọc chương trình khung K19, quy chế đào tạo và syllabus — rồi
        trả lời kèm nguồn để bạn kiểm chứng.
      </Text>
    </View>
  );
}

// ── One message ──────────────────────────────────────────────────────────────

function MessageBlock({
  message,
  isDark,
  sourcesOpen,
  onToggleSources,
  onRate,
}: {
  message: AiChatMessage;
  isDark: boolean;
  sourcesOpen: boolean;
  onToggleSources: () => void;
  onRate: (messageId: string, value: "up" | "down") => void;
}) {
  const mine = message.role === "user";

  if (mine) {
    return (
      <View className="mb-3 flex-row justify-end">
        <View
          className="max-w-[84%] rounded-2xl px-4 py-3"
          style={{ backgroundColor: ORANGE, borderBottomRightRadius: 6 }}
        >
          <Text className="text-[14px] leading-5 text-white">{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4 flex-row gap-2.5">
      {/* The assistant's avatar — the one place the accent sits on this side. */}
      <View
        className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: ORANGE }}
      >
        <MaterialCommunityIcons name="school-outline" size={17} color="#FFFFFF" />
      </View>

      <View className="flex-1">
        {/* The answer body — flat white, hairline edge, no shadow. */}
        <View
          className="rounded-2xl border border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark"
          style={{ borderBottomLeftRadius: 6 }}
        >
          <Text className="text-[14px] leading-[21px] text-ink dark:text-ink-dark">
            {message.content}
          </Text>
        </View>

        {/* Sources — the trust surface. */}
        {message.sources && message.sources.length > 0 ? (
          <View className="mt-2">
            <Pressable
              onPress={onToggleSources}
              accessibilityRole="button"
              accessibilityLabel={
                sourcesOpen ? "Ẩn nguồn trích dẫn" : "Xem nguồn trích dẫn"
              }
              className="flex-row items-center gap-1.5 self-start rounded-lg py-1 active:opacity-70"
            >
              <MaterialCommunityIcons
                name="bookshelf"
                size={14}
                color={isDark ? "#FFA371" : ORANGE_DEEP}
              />
              <Text
                className="text-[12px] font-bold"
                style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
              >
                {message.sources.length} nguồn
              </Text>
              <MaterialCommunityIcons
                name={sourcesOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color={isDark ? "#FFA371" : ORANGE_DEEP}
              />
            </Pressable>

            {sourcesOpen ? (
              <View className="mt-1.5 gap-2">
                {message.sources.map((source) => (
                  <SourceCard key={source.index} source={source} isDark={isDark} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Rating — only on answers. */}
        <View className="mt-2 flex-row items-center gap-1">
          <Text className="mr-1 text-[11px] text-ink-faint dark:text-ink-faint-dark">
            Câu trả lời này có ích không?
          </Text>
          <RatingButton
            icon="thumb-up-outline"
            activeIcon="thumb-up"
            active={message.rating === "up"}
            label="Câu trả lời hữu ích"
            isDark={isDark}
            onPress={() => onRate(message.id, "up")}
          />
          <RatingButton
            icon="thumb-down-outline"
            activeIcon="thumb-down"
            active={message.rating === "down"}
            label="Câu trả lời chưa hữu ích"
            isDark={isDark}
            onPress={() => onRate(message.id, "down")}
          />
        </View>
      </View>
    </View>
  );
}

// ── One cited source ────────────────────────────────────────────────────────

function SourceCard({ source, isDark }: { source: AiSource; isDark: boolean }) {
  return (
    <View
      className="rounded-xl border border-line bg-raised px-3 py-2.5 dark:border-line-dark dark:bg-raised-dark"
    >
      <View className="flex-row items-start gap-2">
        <View
          className="mt-0.5 h-5 w-5 items-center justify-center rounded-md"
          style={{ backgroundColor: isDark ? "#302A24" : "#FFFFFF" }}
        >
          <Text
            className="text-[11px] font-bold tabular-nums"
            style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
          >
            {source.index}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="flex-1 text-[12px] font-bold text-ink dark:text-ink-dark">
              {source.title}
            </Text>
          </View>
          <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {SOURCE_KIND_LABEL[source.kind]} · {source.locator}
          </Text>
          <Text className="mt-1.5 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
            {source.excerpt}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Rating button ───────────────────────────────────────────────────────────

function RatingButton({
  icon,
  activeIcon,
  active,
  label,
  isDark,
  onPress,
}: {
  icon: string;
  activeIcon: string;
  active: boolean;
  label: string;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
      style={{
        backgroundColor: active
          ? isDark
            ? "#2E1C0E"
            : "#FFF1E7"
          : isDark
            ? "#241F1B"
            : "#F2EDE7",
      }}
    >
      <MaterialCommunityIcons
        name={(active ? activeIcon : icon) as any}
        size={15}
        color={active ? (isDark ? "#FFA371" : ORANGE_DEEP) : isDark ? "#A79C93" : "#8B8178"}
      />
    </Pressable>
  );
}

// ── Typing indicator ────────────────────────────────────────────────────────

/**
 * Three dots that breathe while the assistant writes. The animation is
 * opacity + translate only, and it stops as soon as the answer arrives.
 */
function TypingIndicator({ isDark }: { isDark: boolean }) {
  // `useState` with a lazy initialiser rather than `useRef` — the React
  // Compiler lint rules treat reading `ref.current` during render as an
  // error, and a state value is the right thing here anyway: each dot's
  // Animated.Value is created exactly once.
  const [dotA] = useState(() => new Animated.Value(0));
  const [dotB] = useState(() => new Animated.Value(0));
  const [dotC] = useState(() => new Animated.Value(0));
  const dots = useMemo(() => [dotA, dotB, dotC], [dotA, dotB, dotC]);

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 480,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 480,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View className="mb-4 flex-row gap-2.5">
      <View
        className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: ORANGE }}
      >
        <MaterialCommunityIcons name="school-outline" size={17} color="#FFFFFF" />
      </View>

      <View
        className="flex-row items-center gap-1.5 rounded-2xl border border-line bg-surface px-4 py-3.5 dark:border-line-dark dark:bg-surface-dark"
        style={{ borderBottomLeftRadius: 6 }}
      >
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: isDark ? "#A79C93" : "#C3B8AD",
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -3],
                  }),
                },
              ],
            }}
          />
        ))}
        <Text className="ml-1.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
          AI đang trả lời…
        </Text>
      </View>
    </View>
  );
}
