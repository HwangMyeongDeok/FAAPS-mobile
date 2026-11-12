import type { ReactNode } from "react";
import { Text, TextInput, View } from "react-native";

/** Rounded card section with a title. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-4 rounded-3xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
      <Text className="mb-4 text-base font-semibold text-ink dark:text-ink-dark">{title}</Text>
      {children}
    </View>
  );
}

interface RowProps {
  label: string;
  value: string;
  last?: boolean;
}

/** Read-only label/value row with hairline divider. */
export function Row({ label, value, last }: RowProps) {
  return (
    <View
      className={["flex-row items-center justify-between py-2.5", last ? "" : "border-b border-rule dark:border-rule-dark"].join(" ")}
    >
      <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">{label}</Text>
      <Text className="text-sm font-semibold text-ink dark:text-ink-dark">{value}</Text>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (s: string) => void;
  error?: string;
  note?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  last?: boolean;
}

/** Editable text field with inline error + helper note. */
export function Field({
  label,
  value,
  editable,
  onChangeText,
  error,
  note,
  keyboardType,
  last,
}: FieldProps) {
  return (
    <View className={["py-2", last ? "" : "border-b border-rule dark:border-rule-dark"].join(" ")}>
      <Text className="mb-1.5 text-xs text-ink-muted dark:text-ink-muted-dark">{label}</Text>
      <TextInput
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="none"
        placeholderTextColor="#8B8178"
        className={[
          "rounded-xl px-3 py-2.5 text-sm",
          editable
            ? "border border-line bg-raised text-ink dark:border-line-dark dark:bg-raised-dark dark:text-ink-dark"
            : "text-ink dark:text-ink-dark",
        ].join(" ")}
      />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
      {note ? (
        <Text className="mt-1 text-[11px] text-ink-faint dark:text-ink-faint-dark">{note}</Text>
      ) : null}
    </View>
  );
}
