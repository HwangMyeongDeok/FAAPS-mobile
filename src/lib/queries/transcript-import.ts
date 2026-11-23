/**
 * React Query wrappers for the transcript import flow.
 * Screens go through these hooks — never call the service directly —
 * so refetch & cache invalidation stay in one place.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  confirmImport,
  downloadErrorFile,
  getImportDetail,
  getImportHistory,
  previewImport,
  type PickedXlsx,
  type TranscriptImportPreview,
  type TranscriptImportResult,
} from "@/lib/api/transcript-import";
import { transcriptKeys } from "@/lib/queries/transcript";
import { profileKeys } from "@/lib/queries/profile";

export const transcriptImportKeys = {
  all: ["transcript", "imports"] as const,
  history: () => ["transcript", "imports", "history"] as const,
  detail: (id: string) => ["transcript", "imports", "detail", id] as const,
};

/** Import history list (file name, date, row counts, status). */
export function useImportHistory(enabled = true) {
  return useQuery({
    queryKey: transcriptImportKeys.history(),
    queryFn: getImportHistory,
    staleTime: 30_000,
    enabled,
  });
}

/** Re-open a past import as a full row preview. */
export function useImportDetail(importId: string | null) {
  return useQuery({
    queryKey: importId
      ? transcriptImportKeys.detail(importId)
      : ["transcript", "imports", "detail", "none"],
    queryFn: () => getImportDetail(importId!),
    enabled: !!importId,
    staleTime: 60_000,
  });
}

type PreviewVars = { file: PickedXlsx };

/** Upload the .xlsx and receive the row-by-row preview. */
export function usePreviewImport() {
  const qc = useQueryClient();
  return useMutation<TranscriptImportPreview, Error, PreviewVars>({
    mutationFn: ({ file }) => previewImport(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transcriptImportKeys.history() });
    },
  });
}

type ConfirmVars = { importId: string };

/** Confirm a clean preview — then refresh transcript + progress + history. */
export function useConfirmImport() {
  const qc = useQueryClient();
  return useMutation<TranscriptImportResult, Error, ConfirmVars>({
    mutationFn: ({ importId }) => confirmImport(importId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: transcriptKeys.rows() }),
        qc.invalidateQueries({ queryKey: transcriptKeys.progress() }),
        qc.invalidateQueries({ queryKey: profileKeys.progress() }),
        qc.invalidateQueries({ queryKey: transcriptImportKeys.all }),
      ]);
    },
  });
}

type ErrorFileVars = { importId: string; fileName?: string };

/** Download the error workbook; resolves with the raw Blob. */
export function useDownloadErrorFile() {
  return useMutation<Blob, Error, ErrorFileVars>({
    mutationFn: ({ importId }) => downloadErrorFile(importId),
  });
}
