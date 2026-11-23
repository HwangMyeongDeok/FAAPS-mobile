/**
 * CurriculumSelect — a lightweight dropdown for the register form.
 *
 * The register screen needs to pick one curriculum out of the list the
 * backend returns. React Native has no native `<select>`, so this is a
 * pressable that opens a bottom sheet with the options.
 *
 * DESIGN:
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Field bo góc 12px, option card bo góc 16px, shadow nhẹ.
 * - Icon lucide-react-native. Không gradient.
 */
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";

import type { CurriculumChoice } from "@/lib/api/registration";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

interface CurriculumSelectProps {
  curriculums: CurriculumChoice[];
  value: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
}

export function CurriculumSelect({
  curriculums,
  value,
  onChange,
  loading = false,
  error,
  disabled = false,
}: CurriculumSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = curriculums.find((c) => c.id === value) ?? null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel="Chọn chương trình đào tạo"
        className="flex-row items-center justify-between active:opacity-80"
        style={{
          minHeight: 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? "#EF4444" : "#E5E0D8",
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 14,
        }}
      >
        <Text
          className="flex-1 text-[14px]"
          numberOfLines={1}
          style={{ color: selected ? INK : MUTED }}
        >
          {loading
            ? "Đang tải chương trình…"
            : (selected?.name ?? "Chọn chương trình đào tạo")}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={MUTED} />
        ) : (
          <ChevronDown size={18} color={MUTED} />
        )}
      </Pressable>

      {error ? (
        <Text className="mt-1 text-[12px]" style={{ color: "#EF4444" }}>
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          />
          <View
            className="max-h-[70%] rounded-t-3xl px-5 pb-8 pt-4"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <View className="mb-3 items-center">
              <View className="h-1 w-10 rounded-full" style={{ backgroundColor: "#E5E0D8" }} />
            </View>
            <Text className="text-[17px]" style={{ color: INK, fontWeight: "700" }}>
              Chương trình đào tạo
            </Text>
            <Text className="mt-1 text-[13px]" style={{ color: MUTED }}>
              Chọn chương trình bạn đang theo học.
            </Text>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              {curriculums.length === 0 ? (
                <Text
                  className="py-6 text-center text-[13px]"
                  style={{ color: MUTED }}
                >
                  Không có chương trình nào khả dụng.
                </Text>
              ) : (
                curriculums.map((c) => {
                  const active = c.id === value;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        onChange(c.id);
                        setOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Chọn ${c.name}`}
                      className="mb-2 flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
                      style={{
                        borderRadius: 16,
                        backgroundColor: "#FFFFFF",
                        borderWidth: active ? 1.5 : 0,
                        borderColor: active ? FPT_ORANGE : "transparent",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 1,
                      }}
                    >
                      <View className="flex-1">
                        <Text
                          className="text-[15px] leading-5"
                          style={{ color: INK, fontWeight: "600" }}
                        >
                          {c.name}
                        </Text>
                        <Text className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
                          {c.version}
                          {c.majorName ? ` · ${c.majorName}` : ""}
                        </Text>
                      </View>
                      {active ? (
                        <View
                          className="h-7 w-7 items-center justify-center rounded-full"
                          style={{ backgroundColor: FPT_ORANGE }}
                        >
                          <Check size={15} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
