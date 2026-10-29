import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Animated,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Max height of the sheet as a fraction of screen height. Default 0.8 */
  maxHeightRatio?: number;
}

export function Sheet({ open, onClose, children, className, maxHeightRatio = 0.8 }: SheetProps) {
  const { height: SCREEN_H } = useWindowDimensions();
  // `useState` (not `useRef`) so the Animated.Value is a plain value rather than
  // a ref — reading it during render is then legal (react-hooks/refs).
  const [translateY] = useState(() => new Animated.Value(SCREEN_H));

  useEffect(() => {
    if (open) {
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [open, translateY, SCREEN_H]);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);

  return (
    <Modal transparent visible={open} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />
        <Animated.View
          style={{
            transform: [{ translateY }],
            maxHeight: SCREEN_H * maxHeightRatio,
          }}
          className={cn(
            "rounded-t-2xl bg-background border-t border-border",
            className,
          )}
        >
          {/* Drag handle — tapping it closes the sheet. */}
          <Pressable onPress={onClose} className="pt-3 pb-1" hitSlop={12}>
            <View className="self-center h-1 w-10 rounded-full bg-muted" />
          </Pressable>
          {/* Scrollable body — keeps long content (course details, etc.) from
              overflowing the sheet on small screens. */}
          <ScrollView
            className="px-5"
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
