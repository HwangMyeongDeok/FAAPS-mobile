import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ORANGE } from "../format";

interface NewRequestSheetProps {
  subject: string;
  content: string;
  error: string | null;
  isDark: boolean;
  advisorName: string;
  pending: boolean;
  onSubject: (v: string) => void;
  onContent: (v: string) => void;
  onSubmit: () => void;
}

/** Short composer: title + question, advisor named at the top. */
export function NewRequestSheet({
  subject,
  content,
  error,
  isDark,
  advisorName,
  pending,
  onSubject,
  onContent,
  onSubmit,
}: NewRequestSheetProps) {
  return (
    <View>
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: ORANGE }}
        >
          <MaterialCommunityIcons name="message-plus-outline" size={22} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink dark:text-ink-dark">New advising request</Text>
          <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
            Sent to {advisorName}
          </Text>
        </View>
      </View>

      <Text className="mb-1.5 mt-5 text-sm font-bold text-ink dark:text-ink-dark">
        Subject <Text style={{ color: ORANGE }}>*</Text>
      </Text>
      <TextInput
        value={subject}
        onChangeText={onSubject}
        placeholder="e.g. Advice on choosing courses for semester 6"
        placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
        autoCapitalize="sentences"
        accessibilityLabel="Subject of the advising request"
        className="rounded-2xl border border-line px-4 py-3 text-[14px] leading-5 text-ink dark:border-line-dark dark:text-ink-dark"
        style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
      />

      <Text className="mb-1.5 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
        Your question <Text style={{ color: ORANGE }}>*</Text>
      </Text>
      <TextInput
        value={content}
        onChangeText={onContent}
        placeholder="Explain what you need advice on, with context (current GPA, courses you have taken…)"
        placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        accessibilityLabel="Your question"
        className="min-h-[130px] rounded-2xl border border-line px-4 py-3 text-[14px] leading-5 text-ink dark:border-line-dark dark:text-ink-dark"
        style={{ backgroundColor: isDark ? "#12100E" : "#FAF7F4" }}
      />

      {error ? (
        <Text className="mt-1.5 text-xs font-semibold" style={{ color: "#DC2626" }}>
          {error}
        </Text>
      ) : (
        <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          Your advisor usually replies within 1–2 working days
        </Text>
      )}

      <Pressable
        onPress={onSubmit}
        disabled={pending}
        accessibilityRole="button"
        accessibilityLabel="Send the advising request"
        className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85 active:scale-[0.99]"
        style={{ backgroundColor: ORANGE, opacity: pending ? 0.7 : 1 }}
      >
        {pending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name="send" size={17} color="#FFFFFF" />
            <Text className="text-[15px] font-bold text-white">Send request</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
