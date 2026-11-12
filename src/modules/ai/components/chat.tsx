import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { AiChatMessage, AiChatSource } from "@/types/ai";
import { ORANGE, ORANGE_DEEP } from "../format";

export function EmptyChatState() {
  return (
    <View className="items-center px-4 pt-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-tint dark:bg-brand-tint-dark">
        <MaterialCommunityIcons name="robot-happy-outline" size={30} color={ORANGE_DEEP} />
      </View>
      <Text className="mt-4 text-center text-[15px] font-bold text-ink dark:text-ink-dark">
        Ask anything about your programme
      </Text>
      <Text className="mt-1.5 text-center text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark">
        The assistant reads your curriculum, the academic regulations and the course syllabi — then
        answers with sources you can verify.
      </Text>
    </View>
  );
}

interface MessageBlockProps {
  message: AiChatMessage;
  isDark: boolean;
  sourcesOpen: boolean;
  onToggleSources: () => void;
  onRate: (messageId: string, wasHelpful: boolean) => void;
}

export function MessageBlock({ message, isDark, sourcesOpen, onToggleSources, onRate }: MessageBlockProps) {
  const mine = message.sender === "USER";
  if (mine) {
    return (
      <View className="mb-3 flex-row justify-end">
        <View className="max-w-[84%] rounded-2xl px-4 py-3" style={{ backgroundColor: ORANGE, borderBottomRightRadius: 6 }}>
          <Text className="text-[14px] leading-5 text-white">{message.content}</Text>
        </View>
      </View>
    );
  }
  return (
    <View className="mb-4 flex-row gap-2.5">
      <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: ORANGE }}>
        <MaterialCommunityIcons name="school-outline" size={17} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <View
          className="rounded-2xl border border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark"
          style={{ borderBottomLeftRadius: 6 }}
        >
          <Text className="text-[14px] leading-[21px] text-ink dark:text-ink-dark">{message.content}</Text>
          {message.isUnsupported ? (
            <Text className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              This question could not be answered from the available documents.
            </Text>
          ) : null}
        </View>
        {message.sources && message.sources.length > 0 ? (
          <View className="mt-2">
            <Pressable
              onPress={onToggleSources}
              accessibilityRole="button"
              accessibilityLabel={sourcesOpen ? "Hide citations" : "Show citations"}
              className="flex-row items-center gap-1.5 self-start rounded-lg py-1 active:opacity-70"
            >
              <MaterialCommunityIcons name="bookshelf" size={14} color={isDark ? "#FFA371" : ORANGE_DEEP} />
              <Text className="text-[12px] font-bold" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
                {message.sources.length} source{message.sources.length === 1 ? "" : "s"}
              </Text>
              <MaterialCommunityIcons
                name={sourcesOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color={isDark ? "#FFA371" : ORANGE_DEEP}
              />
            </Pressable>
            {sourcesOpen ? (
              <View className="mt-1.5 gap-2">
                {message.sources.map((source, index) => (
                  <SourceCard key={source.chunkId || index} source={source} index={index} isDark={isDark} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        <View className="mt-2 flex-row items-center gap-1">
          <Text className="mr-1 text-[11px] text-ink-faint dark:text-ink-faint-dark">Was this helpful?</Text>
          <RatingButton icon="thumb-up-outline" activeIcon="thumb-up" active={message.wasHelpful === true} label="Helpful answer" isDark={isDark} onPress={() => onRate(message.id, true)} />
          <RatingButton icon="thumb-down-outline" activeIcon="thumb-down" active={message.wasHelpful === false} label="Not a helpful answer" isDark={isDark} onPress={() => onRate(message.id, false)} />
        </View>
      </View>
    </View>
  );
}

export function SourceCard({ source, index, isDark }: { source: AiChatSource; index: number; isDark: boolean }) {
  return (
    <View className="rounded-xl border border-line bg-raised px-3 py-2.5 dark:border-line-dark dark:bg-raised-dark">
      <View className="flex-row items-start gap-2">
        <View
          className="mt-0.5 h-5 w-5 items-center justify-center rounded-md"
          style={{ backgroundColor: isDark ? "#302A24" : "#FFFFFF" }}
        >
          <Text className="text-[11px] font-bold tabular-nums" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
            {index + 1}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="flex-1 text-[12px] font-bold text-ink dark:text-ink-dark">{source.documentTitle}</Text>
          {source.sectionTitle ? (
            <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark">{source.sectionTitle}</Text>
          ) : null}
          {source.quotedText ? (
            <Text className="mt-1.5 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">{source.quotedText}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function RatingButton({
  icon, activeIcon, active, label, isDark, onPress,
}: { icon: string; activeIcon: string; active: boolean; label: string; isDark: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      className="h-8 w-8 items-center justify-center rounded-full active:opacity-70 active:scale-95"
      style={{ backgroundColor: active ? (isDark ? "#2E1C0E" : "#FFF1E7") : isDark ? "#241F1B" : "#F2EDE7" }}
    >
      <MaterialCommunityIcons
        name={(active ? activeIcon : icon) as never}
        size={15}
        color={active ? (isDark ? "#FFA371" : ORANGE_DEEP) : isDark ? "#A79C93" : "#8B8178"}
      />
    </Pressable>
  );
}

export function TypingIndicator({ isDark }: { isDark: boolean }) {
  const [dotA] = useState(() => new Animated.Value(0));
  const [dotB] = useState(() => new Animated.Value(0));
  const [dotC] = useState(() => new Animated.Value(0));
  const dots = useMemo(() => [dotA, dotB, dotC], [dotA, dotB, dotC]);
  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 480, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 480, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);
  return (
    <View className="mb-4 flex-row gap-2.5">
      <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: ORANGE }}>
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
              width: 7, height: 7, borderRadius: 4,
              backgroundColor: isDark ? "#A79C93" : "#C3B8AD",
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
            }}
          />
        ))}
        <Text className="ml-1.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">The AI is answering…</Text>
      </View>
    </View>
  );
}
