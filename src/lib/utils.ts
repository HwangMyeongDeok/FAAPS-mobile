import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with shadcn-style merging.
 * - Resolves conflicting Tailwind classes (later wins).
 * - Accepts arrays, objects, and conditional strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}