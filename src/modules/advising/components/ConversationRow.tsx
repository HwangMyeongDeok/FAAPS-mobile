import { Pressable, Text, View } from "react-native";
import { MessageCircle } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/status";
import type { AdvisingRequest } from "@/types";
import { timeAgo } from "../format";

interface ConversationRowProps {
  conversation: AdvisingRequest;
  onPress: () => void;
}

const ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

/** One inbox card: icon, title, status badge + relative time. */
export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const open =
    conversation.status === "PENDING" ||
    conversation.status === "OPEN" ||
    conversation.status === "IN_PROGRESS";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${conversation.title}, ${conversation.status}`}
      className="active:opacity-80"
    >
      <AppCard className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: open ? "#FFF1E7" : "#F3F4F6" }}
        >
          <MessageCircle size={19} color={open ? ORANGE : MUTED} />
        </View>
        <View className="flex-1">
          <Text
            className="text-[15px] leading-5"
            style={{ color: INK, fontWeight: open ? "700" : "600" }}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            <StatusBadge status={conversation.status} />
            <Text className="text-[11px]" style={{ color: MUTED }}>
              {timeAgo(conversation.updatedAt)}
            </Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
