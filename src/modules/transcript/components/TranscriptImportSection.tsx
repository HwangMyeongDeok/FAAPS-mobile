/**
 * Transcript import — FAB + preview sheet + import history.
 *
 * Split into two mount points because the transcript screen scrolls:
 *   · `TranscriptImportHistory` — renders INSIDE the ScrollView
 *     (history list + past-import detail sheet + error-file download).
 *   · `TranscriptImportFab` — renders OUTSIDE the ScrollView as an overlay
 *     (FAB + preview sheet + pick/confirm toasts) so the orange button
 *     stays pinned to the bottom-right corner.
 *
 * DESIGN RULES (FPT palette, flat — no gradients):
 *   · FPT orange #F37021 for the primary action / FAB
 *   · Cards rounded-2xl (16px), buttons rounded-xl (12px)
 *   · Preview sheet: header + FileSpreadsheet icon, 2-column KPI cards
 *     (valid = green, errors = red), scrollable error list with a red
 *     row-number badge, full-width orange confirm button.
 */
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { Sheet } from "@/components/ui/sheet";
import { EmptyBlock } from "@/components/feedback";
import { cardShadow, floatShadow } from "@/lib/shadow";
import {
  useConfirmImport,
  useDownloadErrorFile,
  useImportDetail,
  useImportHistory,
  usePreviewImport,
} from "@/lib/queries/transcript-import";
import type {
  TranscriptImportHistoryEntry,
  TranscriptImportPreview,
} from "@/lib/api/transcript-import";
import { ORANGE } from "@/modules/transcript/format";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function errorMessageOf(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

/**
 * Persist the error workbook and hand it to the platform share sheet
 * (native) or trigger a browser download (web).
 */
async function saveAndShare(blob: Blob, fileName: string): Promise<void> {
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
    return;
  }
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const dest = new File(Paths.cache, fileName);
  try {
    if (dest.exists) dest.delete();
  } catch {
    /* cache miss — create fresh below */
  }
  dest.create({ overwrite: true });
  await dest.write(buffer);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest.uri, {
      mimeType: XLSX_MIME,
      dialogTitle: "Chia sẻ file lá»—i import",
    });
  }
}

function useToast() {
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3_500);
    return () => clearTimeout(t);
  }, [toast]);
  return { toast, setToast };
}

function Toast({ toast }: { toast: { kind: "success" | "error"; message: string } }) {
  return (
    <View pointerEvents="none" className="absolute inset-x-0 bottom-24 items-center px-6">
      <View
        className="w-full max-w-md flex-row items-center gap-2.5 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: toast.kind === "success" ? "#10B981" : "#241C17",
          ...floatShadow(),
        }}
      >
        <MaterialCommunityIcons
          name={toast.kind === "success" ? "check-circle-outline" : "alert-circle-outline"}
          size={18}
          color={toast.kind === "success" ? "#fff" : "#FFA371"}
        />
        <Text className="flex-1 text-xs leading-4 text-white">{toast.message}</Text>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const confirmed = status === "CONFIRMED";
  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{ backgroundColor: confirmed ? "#DCFCE7" : "#F1F5F9" }}
    >
      <Text
        className="text-[11px] font-bold"
        style={{ color: confirmed ? "#047857" : "#475569" }}
      >
        {confirmed ? "Đã xác nhận" : "Má»›i xem trưá»›c"}
      </Text>
    </View>
  );
}

function KpiCard({
  value,
  label,
  bg,
  fg,
}: {
  value: number;
  label: string;
  bg: string;
  fg: string;
}) {
  return (
    <View
      className="flex-1 items-center rounded-2xl px-3 py-3.5"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-2xl font-bold tabular-nums" style={{ color: fg }}>
        {value}
      </Text>
      <Text className="mt-1 text-[11px] font-bold" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

/* â”€â”€ History (mount INSIDE the ScrollView) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function TranscriptImportHistory() {
  const isDark = useColorScheme() === "dark";
  const [detailId, setDetailId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast, setToast } = useToast();

  const history = useImportHistory(true);
  const detail = useImportDetail(detailId);
  const downloadMut = useDownloadErrorFile();

  const downloadErrors = async (entry: TranscriptImportHistoryEntry) => {
    setDownloadingId(entry.id);
    try {
      const blob = await downloadMut.mutateAsync({ importId: entry.id });
      await saveAndShare(blob, `transcript-import-errors-${entry.id.slice(0, 8)}.xlsx`);
    } catch (error) {
      setToast({
        kind: "error",
        message: errorMessageOf(error, "Không tải Ä‘ược file lá»—i. Vui lòng thử lại."),
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <View className="px-5 pt-6">
      <View className="flex-row items-end justify-between">
        <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
          Lá»‹ch sử Import
        </Text>
        {history.data && history.data.length > 0 ? (
          <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
            {history.data.length} lần
          </Text>
        ) : null}
      </View>

      <View className="mt-3">
        {history.isLoading ? (
          <View
            className="rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark"
            style={cardShadow(isDark)}
          >
            <ActivityIndicator color={ORANGE} />
            <Text className="mt-2 text-center text-xs text-ink-muted dark:text-ink-muted-dark">
              Đang tải lá»‹ch sử import…
            </Text>
          </View>
        ) : history.isError ? (
          <View
            className="rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark"
            style={cardShadow(isDark)}
          >
            <Text className="text-center text-[13px] font-bold text-ink dark:text-ink-dark">
              Không tải Ä‘ược lá»‹ch sử import
            </Text>
            <Pressable
              onPress={() => history.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Thử tải lại lá»‹ch sử import"
              className="mt-3 self-center rounded-xl border border-line px-4 py-2 dark:border-line-dark active:opacity-70"
            >
              <Text className="text-xs font-bold text-ink-muted dark:text-ink-muted-dark">
                Thử lại
              </Text>
            </Pressable>
          </View>
        ) : !history.data?.length ? (
          <EmptyBlock
            icon="file-upload-outline"
            title="Chưa có lần import nào"
            message="Bấm nút cam góc dưá»›i Ä‘á»ƒ chọn file .xlsx bảng Ä‘iá»ƒm và xem trưá»›c."
          />
        ) : (
          <View
            className="overflow-hidden rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark"
            style={cardShadow(isDark)}
          >
            {history.data.map((entry, i) => (
              <View
                key={entry.id}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < history.data!.length - 1
                    ? "border-b border-rule dark:border-rule-dark"
                    : ""
                }`}
              >
                <View className="flex-1">
                  <Text
                    className="text-[13px] font-bold text-ink dark:text-ink-dark"
                    numberOfLines={1}
                  >
                    {entry.fileName}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
                    {formatDateTime(entry.createdAt)} · {entry.rowCount} dòng ·{" "}
                    {entry.errorCount} lá»—i
                  </Text>
                </View>
                <StatusPill status={entry.status} />
                <Pressable
                  onPress={() => setDetailId(entry.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem chi tiết ${entry.fileName}`}
                  hitSlop={8}
                  className="active:opacity-70"
                >
                  <Text className="text-xs font-bold" style={{ color: ORANGE }}>
                    Xem
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => void downloadErrors(entry)}
                  disabled={downloadingId === entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Tải file lá»—i ${entry.fileName}`}
                  hitSlop={8}
                  className="active:opacity-70"
                >
                  {downloadingId === entry.id ? (
                    <ActivityIndicator size="small" color={ORANGE} />
                  ) : (
                    <MaterialCommunityIcons name="download" size={20} color={ORANGE} />
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text className="mt-3 text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
        File Ä‘úng 5 cá»™t: CourseCode · SemesterCode · FinalScore · Status ·
        AttemptNumber. Chá»‰ nhận .xlsx.
      </Text>

      {/* Past-import detail sheet */}
      <Sheet open={!!detailId} onClose={() => setDetailId(null)} maxHeightRatio={0.85}>
        <View>
          <View className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
            >
              <MaterialCommunityIcons name="history" size={22} color={ORANGE} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-ink dark:text-ink-dark">
                Chi tiết import
              </Text>
              <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                {detail.data
                  ? `${detail.data.rowCount} dòng · ${detail.data.errorCount} lá»—i`
                  : "Đang tải…"}
              </Text>
            </View>
          </View>

          {detail.isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={ORANGE} />
            </View>
          ) : detail.isError || !detail.data ? (
            <View className="items-center py-8">
              <Text className="text-sm font-bold text-ink dark:text-ink-dark">
                Không tải Ä‘ược chi tiết
              </Text>
              <Pressable
                onPress={() => detail.refetch()}
                className="mt-3 rounded-xl border border-line px-4 py-2 dark:border-line-dark active:opacity-70"
              >
                <Text className="text-xs font-bold text-ink-muted dark:text-ink-muted-dark">
                  Thử lại
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-4 gap-2">
              {detail.data.rows.map((row) => (
                <View
                  key={row.rowNumber}
                  className="flex-row items-start gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-2.5 dark:border-line-dark dark:bg-surface-dark"
                >
                  <View
                    className="mt-0.5 h-6 min-w-6 items-center justify-center rounded-full px-1.5"
                    style={{ backgroundColor: row.error ? "#EF4444" : "#047857" }}
                  >
                    <Text className="text-[11px] font-bold text-white tabular-nums">
                      {row.rowNumber}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-ink tabular-nums dark:text-ink-dark">
                      {row.courseCode || "—"} · {row.semesterCode || "—"} ·{" "}
                      {row.finalScore != null ? row.finalScore.toFixed(1) : "—"}
                    </Text>
                    {row.error ? (
                      <Text className="mt-0.5 text-xs leading-4" style={{ color: "#EF4444" }}>
                        {row.error}
                      </Text>
                    ) : (
                      <Text className="mt-0.5 text-xs text-ink-faint dark:text-ink-faint-dark">
                        {row.status} · lần {row.attemptNumber}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Sheet>

      {toast ? <Toast toast={toast} /> : null}
    </View>
  );
}

/* â”€â”€ FAB + preview (mount OUTSIDE the ScrollView, as an overlay) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function TranscriptImportFab() {
  const isDark = useColorScheme() === "dark";
  const [preview, setPreview] = useState<TranscriptImportPreview | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast, setToast } = useToast();

  const previewMut = usePreviewImport();
  const confirmMut = useConfirmImport();

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [XLSX_MIME, "application/vnd.ms-excel"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      const name = asset.name ?? "transcript.xlsx";
      if (!/\.xlsx$/i.test(name)) {
        setToast({ kind: "error", message: "Chá»‰ nhận file .xlsx. Vui lòng chọn lại." });
        return;
      }
      setFileName(name);
      const data = await previewMut.mutateAsync({
        file: {
          uri: asset.uri,
          name,
          mimeType: asset.mimeType ?? XLSX_MIME,
        },
      });
      setPreview(data);
    } catch (error) {
      setToast({
        kind: "error",
        message: errorMessageOf(error, "Không Ä‘ọc Ä‘ược file. Vui lòng thử lại."),
      });
    }
  };

  const confirm = async () => {
    if (!preview || preview.errorCount > 0) return;
    try {
      const result = await confirmMut.mutateAsync({ importId: preview.importId });
      setToast({
        kind: "success",
        message: `Import thành công ${result.importedCount} môn.`,
      });
      setPreview(null);
      setFileName(null);
    } catch (error) {
      setToast({
        kind: "error",
        message: errorMessageOf(error, "Xác nhận import thất bại. Vui lòng thử lại."),
      });
    }
  };

  const validCount = preview ? preview.rowCount - preview.errorCount : 0;
  const errorRows = preview?.rows.filter((r) => r.error) ?? [];

  return (
    <>
      <Pressable
        onPress={() => void pickFile()}
        disabled={previewMut.isPending}
        accessibilityRole="button"
        accessibilityLabel="Import bảng Ä‘iá»ƒm từ file xlsx"
        style={[{ backgroundColor: ORANGE }, floatShadow()]}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full active:opacity-85"
      >
        {previewMut.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <MaterialCommunityIcons name="upload" size={24} color="#fff" />
        )}
      </Pressable>

      <Sheet open={!!preview} onClose={() => setPreview(null)} maxHeightRatio={0.88}>
        {preview ? (
          <View>
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
              >
                <MaterialCommunityIcons
                  name="file-excel-outline"
                  size={22}
                  color={ORANGE}
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink dark:text-ink-dark">
                  Xem trưá»›c dữ liá»‡u
                </Text>
                <Text
                  className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark"
                  numberOfLines={1}
                >
                  {fileName ?? "transcript.xlsx"} · {preview.rowCount} dòng
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <KpiCard
                value={validCount}
                label="dòng hợp lá»‡"
                bg={isDark ? "#0B2E1F" : "#DCFCE7"}
                fg={isDark ? "#6EE7B7" : "#047857"}
              />
              <KpiCard
                value={preview.errorCount}
                label="dòng lá»—i"
                bg={isDark ? "#3B0F0F" : "#FEE2E2"}
                fg={isDark ? "#FCA5A5" : "#EF4444"}
              />
            </View>

            {errorRows.length > 0 ? (
              <View className="mt-4">
                <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                  Các dòng lá»—i ({errorRows.length})
                </Text>
                <View
                  className="mt-2 overflow-hidden rounded-2xl border dark:border-line-dark"
                  style={{ borderColor: isDark ? "#302A24" : "#FECACA" }}
                >
                  {errorRows.map((row) => (
                    <View
                      key={row.rowNumber}
                      className="flex-row items-start gap-2.5 bg-surface px-3.5 py-2.5 dark:bg-surface-dark"
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: isDark ? "#262019" : "#FEF2F2",
                      }}
                    >
                      <View
                        className="mt-0.5 h-6 min-w-6 items-center justify-center rounded-full px-1.5"
                        style={{ backgroundColor: "#EF4444" }}
                      >
                        <Text className="text-[11px] font-bold text-white tabular-nums">
                          {row.rowNumber}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-ink tabular-nums dark:text-ink-dark">
                          {row.courseCode || "—"} · {row.semesterCode || "—"}
                        </Text>
                        <Text className="mt-0.5 text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                          {row.error}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                <Text className="mt-2 text-xs leading-4" style={{ color: "#EF4444" }}>
                  Sửa các dòng Ä‘ỏ trong file rá»“i chọn lại file Ä‘á»ƒ xem trưá»›c. Chá»‰ xác
                  nhận Ä‘ược khi không còn dòng lá»—i.
                </Text>
              </View>
            ) : (
              <View
                className="mt-4 flex-row items-center gap-2.5 rounded-2xl px-4 py-3"
                style={{ backgroundColor: isDark ? "#0B2E1F" : "#DCFCE7" }}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color={isDark ? "#6EE7B7" : "#047857"}
                />
                <Text
                  className="flex-1 text-xs font-semibold leading-4"
                  style={{ color: isDark ? "#6EE7B7" : "#047857" }}
                >
                  Mọi dòng Ä‘ều hợp lá»‡. Bấm xác nhận Ä‘á»ƒ ghi {preview.rowCount} môn vào
                  bảng Ä‘iá»ƒm.
                </Text>
              </View>
            )}

            <Pressable
              onPress={() => void confirm()}
              disabled={confirmMut.isPending || preview.errorCount > 0}
              accessibilityRole="button"
              accessibilityLabel="Xác nhận Import"
              style={{
                backgroundColor: ORANGE,
                opacity: confirmMut.isPending || preview.errorCount > 0 ? 0.55 : 1,
              }}
              className="mt-4 flex-row items-center justify-center gap-2 rounded-xl py-4 active:opacity-85"
            >
              {confirmMut.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-bold" size={18} color="#fff" />
                  <Text className="text-[15px] font-bold text-white">Xác nhận Import</Text>
                </>
              )}
            </Pressable>
            {confirmMut.isError ? (
              <Text className="mt-2 text-center text-xs font-semibold" style={{ color: "#EF4444" }}>
                {errorMessageOf(confirmMut.error, "Xác nhận import thất bại.")}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setPreview(null)}
              className="mt-1 items-center py-3 active:opacity-70"
              hitSlop={10}
            >
              <Text className="text-sm font-semibold text-ink-muted dark:text-ink-muted-dark">
                Hủy
              </Text>
            </Pressable>
          </View>
        ) : null}
      </Sheet>

      {toast ? <Toast toast={toast} /> : null}
    </>
  );
}
