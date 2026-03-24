import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { CHAT_MODES } from "@app-types/ai.types";
import type { ChatMode, ChatModeOption } from "@app-types/ai.types";

interface ChatModeTabsProps {
  selected: ChatMode;
  onSelect: (mode: ChatMode) => void;
  disabled: boolean;
}

export function ChatModeTabs({ selected, onSelect, disabled }: ChatModeTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="py-2"
    >
      {CHAT_MODES.map((opt: ChatModeOption) => {
        const isActive = opt.mode === selected;
        return (
          <Pressable
            key={opt.mode}
            onPress={() => {
              if (disabled) return;
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(opt.mode);
            }}
            className={`rounded-full px-4 py-1.5 border ${
              isActive
                ? "bg-primary dark:bg-accent border-primary dark:border-accent"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-white/10"
            }`}
          >
            <Text
              className={`text-[12px] font-sans-semi ${
                isActive ? "text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
