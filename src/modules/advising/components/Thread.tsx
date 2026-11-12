import { useState } from "react";
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

import { ScreenHeader } from "@/components/ScreenHeader";
import {
  useAdvisingRequestDetail,
  useCancelAdvisingRequest,
  useSendAdvisingMessage,
} from "@/lib/queries/advisor";
import type { AdvisingMessage, AdvisingRequest } from "@/types";
import { ORANGE, STATUS_LABEL, initials, timeAgo } from "../format";

interface ThreadProps {
  request: AdvisingRequest;
  onBack: () => void;
}

/** Full thread view: header, messages, composer, cancel action. */
export function Thread({ request, onBack }: ThreadProps) {
  const { data: detail, isLoading } = useAdvisingRequestDetail(request.id);
  const send = useSendAdvisingMessage(request.id);
  const cancel = useCancelAdvisingRequest(request.id);
  const [draft, setDraft] = useState("");
  const isDark = useColorScheme() === "dark";

  const messages = detail?.messages ?? [];
  const closed =
    request.status === "RESOLVED" ||
    request.status === "CANCELLED" ||
    request.status === "ARCHIVED";
  const onSend = () => {
    const content = draft.trim();
    if (!content || send.isPending) return;
    setDraft("");
    send.mutate(content, {
      onError: () => setDraft(content),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title={request.title}
        subtitle={request.advisorName || "Advising"}
        onBack={onBack}
        right={
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4" }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: isDark ? "#FFA371" : "#B5460D" }}
            >
              {initials(request.advisorName || "AD")}
            </Text>
          </View>
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
            contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
            ListEmptyComponent={
              <View className="items-center px-8 pt-16">
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={26}
                  color={isDark ? "#4A423B" : "#C3B8AD"}
                />
                <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
                  No messages in this conversation yet.
                </Text>
              </View>
            }
            renderItem={({ item }) => <Bubble message={item} studentId={request.studentId} />}
          />
        )}

        {closed ? (
          <View className="border-t border-line bg-surface px-4 py-4 dark:border-line-dark dark:bg-surface-dark">
            <Text className="text-center text-xs text-ink-muted dark:text-ink-muted-dark">
              This request is {STATUS_LABEL[request.status] ?? request.status}.
            </Text>
          </View>
        ) : (
          <View className="flex-row items-end gap-2 border-t border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message your advisor..."
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
              accessibilityLabel="Send message"
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-80 active:scale-95"
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
        )}

        {!closed ? (
          <View className="border-t border-rule px-4 py-2 dark:border-rule-dark">
            <Pressable
              onPress={() => cancel.mutate()}
              disabled={cancel.isPending}
              accessibilityRole="button"
              accessibilityLabel="Cancel this request"
              hitSlop={8}
              className="self-start py-1 active:opacity-70"
            >
              <Text className="text-[11px] font-semibold text-ink-faint dark:text-ink-faint-dark underline">
                Cancel request
              </Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** One chat bubble — student right/orange, advisor left/white. */
export function Bubble({
  message,
  studentId,
}: {
  message: AdvisingMessage;
  studentId: string;
}) {
  const isDark = useColorScheme() === "dark";
  const mine = message.senderId === studentId;
  return (
    <View className={`mb-2 flex-row ${mine ? "justify-end" : "justify-start"}`}>
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
          {timeAgo(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}
