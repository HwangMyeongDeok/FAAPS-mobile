/**
 * GAP-5 — ConversationDrawer: danh sách các đoạn chat AI của student.
 *
 * Mở từ nút Menu ở header `ai-chat.tsx`. Mọi logic data (fetch/create) nằm
 * ở screen (container); component này chỉ render UI nhận qua props.
 *
 * DESIGN (bắt buộc):
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Card bo 16px, shadow 0 1px 3px rgba(0,0,0,0.05).
 * - Nút "Đoạn chat mới" bo 12px, cao 48px, font 600, viền cam.
 * - Icon lucide-react-native. Không gradient, không neon, nhiều whitespace.
 */
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from "react-native";
import { MessageCircle, Plus, X } from "lucide-react-native";

import type { AiConversation } from "@/types/ai";

export const DRAWER_FPT_ORANGE = "#F37021";
const FPT_ORANGE = DRAWER_FPT_ORANGE;
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const AI_BG = "#F3F4F6";

/** "2 giờ trước" / "3 ngày trước" — relative time tiếng Việt. */
export function timeAgoVi(iso: string | null): string {
  if (!iso) return "Chưa có tin nhắn";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Date.now() - time;
  if (diff < 0) return "Vừa xong";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

interface ConversationDrawerProps {
  open: boolean;
  onClose: () => void;
  conversations: AiConversation[];
  activeId: string | null;
  creating: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
}

export function ConversationDrawer({
  open,
  onClose,
  conversations,
  activeId,
  creating,
  onNew,
  onSelect,
}: ConversationDrawerProps) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 flex-row">
        {/* Panel trái */}
        <View
          className="h-full w-[85%] max-w-[340px]"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
            <Text
              accessibilityRole="header"
              className="text-[17px]"
              style={{ color: INK, fontWeight: "700" }}
            >
              Cuộc trò chuyện
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Đóng danh sách trò chuyện"
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: AI_BG }}
            >
              <X size={20} color={INK} />
            </Pressable>
          </View>

          {/* Nút đoạn chat mới */}
          <View className="px-5 pb-4">
            <Pressable
              onPress={onNew}
              disabled={creating}
              accessibilityRole="button"
              accessibilityLabel="Tạo đoạn chat mới"
              className="flex-row items-center justify-center gap-2 active:opacity-80"
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: FPT_ORANGE,
                backgroundColor: "#FFFFFF",
              }}
            >
              {creating ? (
                <ActivityIndicator color={FPT_ORANGE} size="small" />
              ) : (
                <Plus size={18} color={FPT_ORANGE} />
              )}
              <Text
                className="text-[15px]"
                style={{ color: FPT_ORANGE, fontWeight: "600" }}
              >
                {creating ? "Đang tạo…" : "Đoạn chat mới"}
              </Text>
            </Pressable>
          </View>

          {/* Danh sách */}
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center px-6 pt-10">
                <View
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: AI_BG }}
                >
                  <MessageCircle size={24} color={MUTED} />
                </View>
                <Text
                  className="mt-3 text-center text-[14px]"
                  style={{ color: INK, fontWeight: "600" }}
                >
                  Chưa có cuộc trò chuyện nào
                </Text>
                <Text
                  className="mt-1 text-center text-[13px] leading-5"
                  style={{ color: MUTED }}
                >
                  Bấm “Đoạn chat mới” để bắt đầu hỏi đáp với trợ lý AI.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const active = item.id === activeId;
              return (
                <Pressable
                  onPress={() => onSelect(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Mở cuộc trò chuyện ${item.title}`}
                  className="active:opacity-80"
                  style={{
                    borderRadius: 16,
                    backgroundColor: "#FFFFFF",
                    padding: 16,
                    borderWidth: active ? 1.5 : 0,
                    borderColor: active ? FPT_ORANGE : "transparent",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="mt-0.5 h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: active ? FPT_ORANGE : AI_BG,
                      }}
                    >
                      <MessageCircle
                        size={17}
                        color={active ? "#FFFFFF" : MUTED}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-[15px] leading-5"
                        numberOfLines={2}
                        style={{ color: INK, fontWeight: "600" }}
                      >
                        {item.title || "Cuộc trò chuyện mới"}
                      </Text>
                      <Text
                        className="mt-1 text-[12px]"
                        style={{ color: MUTED }}
                      >
                        {item.messageCount} tin nhắn ·{" "}
                        {timeAgoVi(item.lastMessageAt)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Backdrop — bấm ra ngoài để đóng */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
          className="h-full flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        />
      </View>
    </Modal>
  );
}
