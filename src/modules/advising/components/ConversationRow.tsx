import { Pressable, Text, View, useColorScheme } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { AdvisingRequest } from "@/types";
import { ORANGE_DEEP, STATUS_LABEL, timeAgo } from "../format";

interface ConversationRowProps {
  conversation: AdvisingRequest;
  onPress: () => void;
}

/** One inbox row: open threads bold with tinted icon, closed ones muted. */
export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const isDark = useColorScheme() === "dark";
  const open =
    conversation.status === "PENDING" ||
    conversation.status === "OPEN" ||
    conversation.status === "IN_PROGRESS";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={conversation.title}
      className="flex-row items-center gap-3 py-4 active:opacity-70"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: open
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
          color={open ? (isDark ? "#FFA371" : ORANGE_DEEP) : isDark ? "#7D746C" : "#8B8178"}
        />
      </View>
      <View className="flex-1">
        <Text
          className="text-[15px] leading-5 text-ink dark:text-ink-dark"
          style={{ fontWeight: open ? "700" : "500" }}
          numberOfLines={1}
        >
          {conversation.title}
        </Text>
        <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          {STATUS_LABEL[conversation.status] ?? conversation.status} ·{" "}
          {timeAgo(conversation.updatedAt)}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={isDark ? "#4A423B" : "#C3B8AD"}
      />
    </Pressable>
  );
}

/* v1 row — kept stable for inbox list virtualization. */
