/**
 * EditorSheet — pick the courses of one term and save the draft.
 *
 * DESIGN (bắt buá»™c):
 * - Bottom sheet trượt lên (dùng `Sheet` của `src/components/ui`).
 * - Header "Chá»‰nh sửa kế hoạch" + nút Close.
 * - Bottom action bar: "Lưu nháp" (outline) + "Gửi duyá»‡t" (cam fill).
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Card bo góc 16px, shadow 0 1px 3px rgba(0,0,0,0.05), button bo 12px.
 * - Icon lucide-react-native. Không gradient, không neon.
 */
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AlertTriangle, CheckCircle2, Search, X } from "lucide-react-native";

import type { CurriculumCourse, CurriculumPlan, PlanSemester } from "@/types";
import { type EditorCourseRow } from "../format";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const SUCCESS = "#10B981";
const WARNING_BG = "#FEF3E2";
const WARNING_BORDER = "#FCD9A8";
const SUCCESS_BG = "#ECFDF5";
const SUCCESS_BORDER = "#A7F3D0";
const FIELD_BG = "#FFFFFF";
const FIELD_BORDER = "#E5E0D8";

interface EditorSheetProps {
  semester: PlanSemester;
  plan: CurriculumPlan | null;
  curriculum: CurriculumCourse[];
  query: string;
  onQuery: (q: string) => void;
  isDark: boolean;
  saving: boolean;
  /** Issues from `GET /api/student/study-plans/{id}/validate`. */
  issues?: string[];
  issuesLoading?: boolean;
  issuesError?: boolean;
  onClose: () => void;
  onSave: (courseIds: string[]) => void;
}

/** The course picker: selected list, search, candidates, actions. */
export function EditorSheet({
  semester,
  plan,
  curriculum,
  query,
  onQuery,
  isDark,
  saving,
  issues,
  issuesLoading = false,
  issuesError = false,
  onClose,
  onSave,
}: EditorSheetProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    plan?.courses.map((c) => c.id) ?? [],
  );

  const lookup = useMemo(() => {
    const m = new Map<string, EditorCourseRow>();
    for (const c of curriculum) {
      m.set(c.courseId, {
        courseId: c.courseId,
        code: c.code,
        name: c.name,
        credits: c.credits,
        semesterNumber: c.semesterNumber,
        mandatory: c.mandatory,
      });
    }
    for (const c of plan?.courses ?? []) {
      if (!m.has(c.id)) {
        m.set(c.id, {
          courseId: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          semesterNumber: 0,
          mandatory: false,
        });
      }
    }
    return m;
  }, [curriculum, plan]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return curriculum
      .filter((c) => !selected.includes(c.courseId))
      .filter((c) =>
        q
          ? c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
          : true,
      );
  }, [curriculum, selected, query]);

  const selectedCourses = useMemo(
    () =>
      selected.map((id) => lookup.get(id)).filter((c): c is EditorCourseRow => !!c),
    [selected, lookup],
  );

  const totalCredits = selectedCourses.reduce((s, c) => s + c.credits, 0);

  const toggle = (course: EditorCourseRow) => {
    setSelected((prev) =>
      prev.includes(course.courseId)
        ? prev.filter((id) => id !== course.courseId)
        : [...prev, course.courseId],
    );
  };

  // Issues chá»‰ có ý nghĩa khi Ä‘ang xem má»™t plan Ä‘ã tá»“n tại.
  const activeIssues = plan ? (issues ?? []) : [];
  const hasIssues = activeIssues.length > 0;

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-start justify-between gap-3 pb-1">
        <View className="flex-1">
          <Text className="text-[17px]" style={{ color: INK, fontWeight: "700" }}>
            Chá»‰nh sửa kế hoạch
          </Text>
          <Text className="mt-1 text-[13px]" style={{ color: MUTED }}>
            {semester.name} · {selectedCourses.length} môn · {totalCredits} tín chá»‰
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <X size={20} color={INK} />
        </Pressable>
      </View>

      {/* Banner validate — phía trên form */}
      {plan ? (
        issuesLoading ? (
          <View
            className="mt-4 flex-row items-center gap-2 px-3.5 py-3"
            style={{
              borderRadius: 12,
              backgroundColor: FIELD_BG,
              borderWidth: 1,
              borderColor: FIELD_BORDER,
            }}
          >
            <ActivityIndicator size="small" color={MUTED} />
            <Text className="text-[12px]" style={{ color: MUTED }}>
              Đang kiá»ƒm tra kế hoạch…
            </Text>
          </View>
        ) : issuesError ? (
          <View
            className="mt-4 px-3.5 py-3"
            style={{
              borderRadius: 12,
              backgroundColor: FIELD_BG,
              borderWidth: 1,
              borderColor: FIELD_BORDER,
            }}
          >
            <Text className="text-[12px]" style={{ color: MUTED }}>
              Không kiá»ƒm tra Ä‘ược kế hoạch lúc này. Bạn vẫn có thá»ƒ lưu nháp.
            </Text>
          </View>
        ) : hasIssues ? (
          <View
            className="mt-4 px-3.5 py-3"
            style={{
              borderRadius: 12,
              backgroundColor: WARNING_BG,
              borderWidth: 1,
              borderColor: WARNING_BORDER,
            }}
          >
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={16} color="#B45309" />
              <Text className="text-[13px]" style={{ color: "#B45309", fontWeight: "600" }}>
                Có {activeIssues.length} vấn Ä‘ề cần xử lý
              </Text>
            </View>
            <View className="mt-2 gap-1">
              {activeIssues.map((issue, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <View
                    className="mt-[7px] h-1 w-1 rounded-full"
                    style={{ backgroundColor: "#B45309" }}
                  />
                  <Text
                    className="flex-1 text-[12px] leading-[17px]"
                    style={{ color: "#92400E" }}
                  >
                    {issue}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View
            className="mt-4 flex-row items-center gap-2 px-3.5 py-3"
            style={{
              borderRadius: 12,
              backgroundColor: SUCCESS_BG,
              borderWidth: 1,
              borderColor: SUCCESS_BORDER,
            }}
          >
            <CheckCircle2 size={16} color={SUCCESS} />
            <Text className="text-[13px]" style={{ color: "#047857", fontWeight: "600" }}>
              Kế hoạch hợp lá»‡
            </Text>
          </View>
        )
      ) : null}

      {/* Môn Ä‘ã chọn */}
      {selectedCourses.length > 0 ? (
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px]" style={{ color: INK, fontWeight: "600" }}>
              Đã chọn
            </Text>
            <Text className="text-[12px] tabular-nums" style={{ color: MUTED }}>
              {selectedCourses.length} môn · {totalCredits} tín chá»‰
            </Text>
          </View>

          <View className="mt-2 gap-2">
            {selectedCourses.map((c) => (
              <View
                key={c.courseId}
                className="flex-row items-center gap-3 px-3.5 py-3"
                style={{
                  borderRadius: 16,
                  backgroundColor: FIELD_BG,
                  borderWidth: 1,
                  borderColor: FIELD_BORDER,
                }}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] tabular-nums" style={{ color: "#B45309", fontWeight: "700" }}>
                      {c.code}
                    </Text>
                    <Text className="text-[11px] tabular-nums" style={{ color: MUTED }}>
                      {c.credits} cr
                    </Text>
                    {c.mandatory ? (
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: "#FFF1E7" }}
                      >
                        <Text className="text-[10px]" style={{ color: "#B45309", fontWeight: "700" }}>
                          BẮT BUá»˜C
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="mt-0.5 text-[13px]" style={{ color: INK, fontWeight: "600" }} numberOfLines={2}>
                    {c.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggle(c)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${c.code} khỏi kế hoạch`}
                  className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  <X size={17} color="#B45309" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Tìm kiếm */}
      <View
        className="mt-4 flex-row items-center gap-2 px-3.5 py-3"
        style={{
          borderRadius: 12,
          backgroundColor: FIELD_BG,
          borderWidth: 1,
          borderColor: FIELD_BORDER,
        }}
      >
        <Search size={18} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Tìm theo mã hoặc tên môn…"
          placeholderTextColor={MUTED}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-[14px]"
          style={{ color: INK }}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => onQuery("")} hitSlop={8} accessibilityLabel="Xóa tìm kiếm">
            <X size={17} color={MUTED} />
          </Pressable>
        ) : null}
      </View>

      {/* Danh sách môn có thá»ƒ chọn */}
      {candidates.length === 0 ? (
        <View className="items-center py-8">
          <Search size={34} color="#CBD5E1" />
          <Text className="mt-3 text-center text-[13px]" style={{ color: MUTED }}>
            {curriculum.length === 0
              ? "Chương trình Ä‘ào tạo chưa khả dụng."
              : "Không có môn nào khá»›p tìm kiếm."}
          </Text>
        </View>
      ) : (
        <ScrollView className="mt-3" style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
          <View className="gap-2">
            {candidates.map((c) => (
              <Pressable
                key={c.courseId}
                onPress={() =>
                  toggle({
                    courseId: c.courseId,
                    code: c.code,
                    name: c.name,
                    credits: c.credits,
                    semesterNumber: c.semesterNumber,
                    mandatory: c.mandatory,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Thêm ${c.code} vào kế hoạch`}
                className="flex-row items-center gap-3 px-3.5 py-3 active:opacity-80"
                style={{
                  borderRadius: 16,
                  backgroundColor: FIELD_BG,
                  borderWidth: 1,
                  borderColor: FIELD_BORDER,
                }}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] tabular-nums" style={{ color: "#B45309", fontWeight: "700" }}>
                      {c.code}
                    </Text>
                    <Text className="text-[11px] tabular-nums" style={{ color: MUTED }}>
                      {c.credits} cr
                    </Text>
                    {c.semesterNumber ? (
                      <Text className="text-[11px]" style={{ color: MUTED }}>
                        · học kỳ {c.semesterNumber}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="mt-0.5 text-[13px]" style={{ color: INK, fontWeight: "600" }} numberOfLines={2}>
                    {c.name}
                  </Text>
                </View>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: FPT_ORANGE }}
                >
                  <Text className="text-[18px] leading-5" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    +
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Bottom action bar — Lưu nháp (outline) + Gửi duyá»‡t (cam fill) */}
      <View
        className="mt-5 flex-row gap-2.5 border-t pt-4"
        style={{ borderTopColor: FIELD_BORDER }}
      >
        <Pressable
          onPress={() => onSave(selected)}
          disabled={saving || selected.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Lưu nháp"
          className="flex-1 flex-row items-center justify-center gap-1.5 active:opacity-85"
          style={{
            height: 48,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: FPT_ORANGE,
            backgroundColor: "#FFFFFF",
            opacity: saving || selected.length === 0 ? 0.5 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color={FPT_ORANGE} size="small" />
          ) : (
            <Text className="text-[15px]" style={{ color: FPT_ORANGE, fontWeight: "600" }}>
              Lưu nháp
            </Text>
          )}
        </Pressable>

        <Pressable
          disabled
          accessibilityRole="button"
          accessibilityLabel="Gửi duyá»‡t — cần lưu nháp trưá»›c"
          className="flex-1 flex-row items-center justify-center gap-1.5"
          style={{
            height: 48,
            borderRadius: 12,
            backgroundColor: hasIssues ? "#E5E0D8" : FPT_ORANGE,
            opacity: 0.6,
          }}
        >
          <Text
            className="text-[15px]"
            style={{ color: hasIssues ? MUTED : "#FFFFFF", fontWeight: "600" }}
          >
            Gửi duyá»‡t
          </Text>
        </Pressable>
      </View>

      {hasIssues ? (
        <Text className="mt-2 text-center text-[11px] leading-4" style={{ color: MUTED }}>
          Cần xử lý các vấn Ä‘ề trên trưá»›c khi gửi kế hoạch Ä‘i duyá»‡t.
        </Text>
      ) : null}
    </View>
  );
}
