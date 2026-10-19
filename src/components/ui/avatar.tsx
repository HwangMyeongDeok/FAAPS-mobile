import { cn } from "@/lib/utils";
import { Image, Text, View } from "react-native";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

/** Returns initials from a full name (up to 2 chars) */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Avatar({ src, name = "?", size = "md", className }: AvatarProps) {
  return (
    <View
      className={cn(
        "rounded-full bg-muted items-center justify-center overflow-hidden shrink-0",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <Image source={{ uri: src }} className="h-full w-full" />
      ) : (
        <Text className="font-semibold text-muted-foreground">
          {initials(name)}
        </Text>
      )}
    </View>
  );
}
