/**
 * AuthField — one labelled text field for the auth screens.
 *
 * DESIGN:
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Field bo góc 12px, cao 48px, viền #E5E0D8 (cam khi focus, đỏ khi lỗi).
 * - Icon lucide-react-native. Không gradient.
 */
import { AlertCircle } from "lucide-react-native";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const DANGER = "#EF4444";

interface AuthFieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "go" | "send";
}

export function AuthField({
  label,
  icon,
  error,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  editable = true,
  onBlur,
  onSubmitEditing,
  returnKeyType,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text className="mb-1.5 text-[13px]" style={{ color: INK, fontWeight: "600" }}>
        {label}
      </Text>
      <View
        className="flex-row items-center px-3.5"
        style={{
          minHeight: 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? DANGER : focused ? FPT_ORANGE : "#E5E0D8",
          backgroundColor: "#FFFFFF",
          opacity: editable ? 1 : 0.6,
        }}
      >
        <View className="mr-2.5">{icon}</View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          accessibilityLabel={label}
          className="flex-1 text-[14px]"
          style={{ color: INK }}
        />
      </View>
      {error ? (
        <View className="mt-1 flex-row items-center gap-1.5">
          <AlertCircle size={13} color={DANGER} />
          <Text className="text-[12px]" style={{ color: DANGER }}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
