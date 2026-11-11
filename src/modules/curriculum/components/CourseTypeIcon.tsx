import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Visual mapping for a course category.
 *
 * The backend stores the category as a free-text name (`course_categories.name`),
 * so the icon is chosen by keyword and falls back to a neutral book icon.
 */
export interface CourseCategoryVisual {
  iconName: string;
  color: string;
  bgClass: string;
  label: string;
}

const GENERIC: CourseCategoryVisual = {
  iconName: "book-open-page-variant",
  color: "#1D4ED8",
  bgClass: "bg-blue-100",
  label: "Course",
};

const KEYWORDS: { match: RegExp; visual: Omit<CourseCategoryVisual, "label"> }[] = [
  {
    match: /core|major|foundation|compulsory/i,
    visual: {
      iconName: "book-open-page-variant",
      color: "#1D4ED8",
      bgClass: "bg-blue-100",
    },
  },
  {
    match: /elect/i,
    visual: {
      iconName: "layers-triple",
      color: "#6D28D9",
      bgClass: "bg-purple-100",
    },
  },
  {
    match: /practicum|intern|ojt|lab|project/i,
    visual: {
      iconName: "flask",
      color: "#047857",
      bgClass: "bg-emerald-100",
    },
  },
  {
    match: /project|thesis|capstone/i,
    visual: {
      iconName: "school",
      color: "#B45309",
      bgClass: "bg-amber-100",
    },
  },
  {
    match: /general|english|soft|math/i,
    visual: {
      iconName: "alphabetical",
      color: "#0F766E",
      bgClass: "bg-teal-100",
    },
  },
];

/** Resolve the visual for a category name coming from the backend. */
export function courseCategoryVisual(category?: string | null): CourseCategoryVisual {
  if (!category) return GENERIC;
  const found = KEYWORDS.find((k) => k.match.test(category));
  if (!found) return { ...GENERIC, label: category };
  return { ...found.visual, label: category };
}

/** The icon for a category name. */
export function CourseTypeIcon({
  category,
  size = 18,
  bgClass,
}: {
  category?: string | null;
  size?: number;
  bgClass?: string;
}) {
  const c = courseCategoryVisual(category);
  return (
    <View className={`items-center justify-center rounded-lg p-2 ${bgClass ?? c.bgClass}`}>
      <MaterialCommunityIcons name={c.iconName as any} size={size} color={c.color} />
    </View>
  );
}

/** The label shown on the badge. */
export const courseTypeLabel = (category?: string | null) =>
  courseCategoryVisual(category).label;

/** The badge variant for a category. */
export const courseTypeBadgeClass = (
  category?: string | null,
): "default" | "secondary" | "success" | "warning" => {
  const icon = courseCategoryVisual(category).iconName;
  switch (icon) {
    case "layers-triple":
      return "secondary";
    case "flask":
      return "success";
    case "school":
      return "warning";
    default:
      return "default";
  }
};
