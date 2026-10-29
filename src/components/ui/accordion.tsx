import { cn } from "@/lib/utils";
import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ title, defaultOpen = false, children, className }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rotateAnim = useState(new Animated.Value(defaultOpen ? 1 : 0))[0];

  const toggle = () => {
    Animated.spring(rotateAnim, {
      toValue: open ? 0 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  return (
    <View className={cn("border-b border-border", className)}>
      <Pressable onPress={toggle} className="flex-row items-center justify-between py-4 px-1">
        <Text className="flex-1 text-base font-medium text-foreground pr-4">{title}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-180deg"] }) }] }}>
          <ChevronDown size={20} color="hsl(215.4 16.3% 46.9%)" />
        </Animated.View>
      </Pressable>
      {open && <View className="pb-4 px-1">{children}</View>}
    </View>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <View className={cn("", className)}>{children}</View>;
}
