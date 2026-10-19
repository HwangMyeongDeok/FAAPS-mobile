import { cn } from "@/lib/utils";
import { useState, type ComponentProps } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export interface InputProps {
  error?: string;
  label?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  value?: string;
  onChangeText?: ComponentProps<typeof TextInput>["onChangeText"];
  onFocus?: ComponentProps<typeof TextInput>["onFocus"];
  onBlur?:  ComponentProps<typeof TextInput>["onBlur"];
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  error, label, hint, leftElement, rightElement, className,
  value, onChangeText, onFocus, onBlur, placeholder,
  autoCapitalize, keyboardType, secureTextEntry, multiline, numberOfLines,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full">
      {label && <Text className="text-sm font-medium text-foreground mb-1.5 block">{label}</Text>}
      <View
        className={cn(
          "flex-row items-center border rounded-md bg-background px-3",
          error ? "border-destructive" : focused ? "border-ring" : "border-input",
          multiline ? "h-auto py-2 items-start" : "h-11"
        )}
      >
        {leftElement && <View className="mr-2 shrink-0">{leftElement}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); onBlur?.(e);  }}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholderTextColor="hsl(215.4 16.3% 46.9%)"
          className={cn("flex-1 text-base text-foreground", className)}
        />
        {rightElement && <View className="ml-2 shrink-0">{rightElement}</View>}
      </View>
      {error && <Text className="text-xs text-destructive mt-1">{error}</Text>}
      {hint  && !error && <Text className="text-xs text-muted-foreground mt-1">{hint}</Text>}
    </View>
  );
}
