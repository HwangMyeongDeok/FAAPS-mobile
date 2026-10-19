import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  View,
} from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, children, className }: SheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

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
  }, [open, translateY]);

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
          style={{ transform: [{ translateY }] }}
          className={cn("rounded-t-2xl bg-background border-t border-border p-5", className)}
        >
          <View className="self-center mb-4 h-1 w-10 rounded-full bg-muted" />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
