import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type CourseType = "CORE" | "ELECTIVE" | "PRACTICUM" | "PROJECT";

interface CourseTypeIconProps {
  type: CourseType;
  size?: number;
  /** Tailwind background color class, e.g. "bg-primary" */
  bgClass?: string;
  /** Tailwind text/icon color class, e.g. "text-primary-foreground" */
  fgClass?: string;
}

const config: Record<CourseType, {
  iconName: string;
  bgClass: string;
  fgClass: string;
  label: string;
}> = {
  CORE:      { iconName: "book-open-page-variant", bgClass: "bg-blue-100",   fgClass: "text-blue-700",   label: "Core"      },
  ELECTIVE:  { iconName: "layers-triple",         bgClass: "bg-purple-100", fgClass: "text-purple-700", label: "Elective"  },
  PRACTICUM: { iconName: "flask",                 bgClass: "bg-emerald-100",fgClass: "text-emerald-700",label: "Practicum" },
  PROJECT:   { iconName: "school",                bgClass: "bg-amber-100",  fgClass: "text-amber-700",  label: "Project"   },
};

export function CourseTypeIcon({ type, size = 18, bgClass, fgClass }: CourseTypeIconProps) {
  const c = config[type];
  return (
    <View className={`items-center justify-center rounded-lg p-2 ${bgClass ?? c.bgClass}`}>
      <MaterialCommunityIcons
        name={c.iconName as any}
        size={size}
        color="currentColor"
      />
    </View>
  );
}

export const courseTypeLabel = (t: CourseType) => config[t].label;
export const courseTypeBadgeClass = (t: CourseType): "default" | "secondary" | "success" | "warning" => {
  switch (t) {
    case "CORE":      return "default";
    case "ELECTIVE":  return "secondary";
    case "PRACTICUM": return "success";
    case "PROJECT":   return "warning";
  }
};
