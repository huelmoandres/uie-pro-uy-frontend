import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useColorScheme } from "@/components/base/useColorScheme";

/**
 * Custom back button for the Stack navigator.
 * Replaces the default "(tabs)" text with a clean rounded icon button.
 */
export function HeaderBackButton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(15,23,42,0.05)",
          opacity: pressed ? 0.6 : 1,
        },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ChevronLeft
        size={20}
        color={isDark ? "#94A3B8" : "#334155"}
        strokeWidth={2.5}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 36,
    width: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});
