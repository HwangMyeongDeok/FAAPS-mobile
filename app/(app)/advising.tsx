/**
 * FE-S-5 — Advisor advising (1-on-1 chat).
 *
 * The screen answers one question: "What has my advisor said?"
 * It is an inbox first and a thread second: the conversation list is the
 * default view, and opening one replaces it with the thread so the user
 * never has to navigate through two levels on a phone.
 *
 * Data comes from:
 *   • `GET  /api/student/advising-requests`
 *   • `GET  /api/student/advising-requests/{id}`
 *   • `POST /api/student/advising-requests/{id}/messages`
 *   • `PATCH /api/student/advising-requests/{id}/cancel`
 */

import { useMemo, useState } from "react";
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
  useAdvisingRequestDetail,
  useAdvisingRequests,
  useCancelAdvisingRequest,
  useCreateAdvisingRequest,
  useSendAdvisingMessage,
} from "@/lib/queries/advisor";
import { useMyAdvisor } from "@/lib/queries/profile";
import type { AdvisingMessage, AdvisingRequest } from "@/types";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

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
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("en-US");
}

export default function AdvisingScreen() {
  const { conversation } = useLocalSearchParams<{ conversation?: string }>();
  const { data: advisor } = useMyAdvisor();

  // `activeId` is `null` when the user closed a thread, and follows the deep
  // link otherwise. Adjusting it during render (rather than in an effect)
  // keeps the deep link and the local choice in sync without a second render.
  const [activeId, setActiveId] = useState<string | null>(conversation ?? null);
  const [lastLink, setLastLink] = useState(conversation);
  if (conversation !== lastLink) {
    setLastLink(conversation);
    setActiveId(conversation ?? null);
  }

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
  } = useAdvisingRequests();
  const isDark = useColorScheme() === "dark";

  const createRequest = useCreateAdvisingRequest();

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const onCreate = () => {
    const title = subject.trim();
    const body = content.trim();
    if (title.length < 5) {
      setFormError("The subject must be at least 5 characters.");
      return;
    }
    if (body.length < 10) {
      setFormError(
        "Describe your question in at least 10 characters so the advisor can help faster.",
      );
      return;
    }
    setFormError(null);

    createRequest.mutate(
      { title, description: body },
      {
        onSuccess: (created) => {
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
        request={active}
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
        title="Advising"
        subtitle="Talk directly to your assigned advisor"
        onBack={goBack}
        right={
          <Pressable
            onPress={() => {
              setFormError(null);
              setComposing(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Create a new advising request"
            className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2.5 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <MaterialCommunityIcons name="plus" size={15} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white">New request</Text>
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
            Could not load your conversations. Pull down to try again.
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
                No conversations yet
              </Text>
              <Text className="mt-1 text-center text-xs text-ink-muted dark:text-ink-muted-dark">
                When your advisor replies to a question, the conversation shows
                up here.
              </Text>
              <Pressable
                onPress={() => {
                  setFormError(null);
                  setComposing(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Create a new advising request"
                className="mt-5 flex-row items-center gap-2 rounded-full px-5 py-3 active:opacity-85"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="plus" size={17} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white">
                  Create a request
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
          advisorName={advisor?.fullName ?? "Your advisor"}
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
  conversation: AdvisingRequest;
  onPress: () => void;
}) {
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
          color={
            open
              ? isDark
                ? "#FFA371"
                : ORANGE_DEEP
              : isDark
                ? "#7D746C"
                : "#8B8178"
          }
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

// ── Thread ───────────────────────────────────────────────────────────────────

function Thread({
  request,
  onBack,
}: {
  request: AdvisingRequest;
  onBack: () => void;
}) {
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
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
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
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
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
                <Text className="text-center text-sm text-ink-muted dark:text-ink-muted-dark">
                  No messages in this conversation yet.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Bubble message={item} studentId={request.studentId} />
            )}
          />
        )}

        {/* Composer */}
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
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
              style={{
                backgroundColor: draft.trim()
                  ? ORANGE
                  : isDark
                    ? "#302A24"
                    : "#E4DCD3",
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

        {/* Cancel action */}
        {!closed ? (
          <View className="border-t border-rule px-4 py-2 dark:border-rule-dark">
            <Pressable
              onPress={() => cancel.mutate()}
              disabled={cancel.isPending}
              accessibilityRole="button"
              accessibilityLabel="Cancel this request"
              hitSlop={8}
              className="self-start py-1"
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

// ── Message bubble ───────────────────────────────────────────────────────────

function Bubble({
  message,
  studentId,
}: {
  message: AdvisingMessage;
  studentId: string;
}) {
  const isDark = useColorScheme() === "dark";
  // The student speaks on the right; the advisor on the left.
  const mine = message.senderId === studentId;

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
          {timeAgo(message.createdAt)}
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
          <MaterialCommunityIcons
            name="message-plus-outline"
            size={22}
            color="#FFFFFF"
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink dark:text-ink-dark">
            New advising request
          </Text>
          <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
            Sent to {advisorName}
          </Text>
        </View>
      </View>

      {/* Subject */}
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

      {/* Content */}
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
        className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
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
