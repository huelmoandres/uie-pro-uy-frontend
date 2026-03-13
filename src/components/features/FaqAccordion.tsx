import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import type { FaqItem } from "@constants/faqs";

interface FaqAccordionProps {
  items: FaqItem[];
  /** Índice del ítem abierto (null = ninguno) */
  openIndex: number | null;
  onToggle: (index: number) => void;
}

/**
 * Acordeón de preguntas frecuentes reutilizable.
 */
export function FaqAccordion({
  items,
  openIndex,
  onToggle,
}: FaqAccordionProps) {
  return (
    <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const isLast = index === items.length - 1;

        return (
          <View
            key={index}
            className={
              isLast ? "" : "border-b border-slate-50 dark:border-white/5"
            }
          >
            <Pressable
              onPress={() => onToggle(index)}
              className="flex-row items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5"
            >
              <Text
                className={`flex-1 pr-4 font-sans-semi text-[14px] leading-tight ${
                  isOpen ? "text-accent" : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {faq.question}
              </Text>
              {isOpen ? (
                <ChevronUp size={18} color="#B89146" />
              ) : (
                <ChevronDown size={18} color="#94A3B8" />
              )}
            </Pressable>
            {isOpen && (
              <View className="px-4 pb-4 pt-1">
                <Text className="font-sans text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {faq.answer}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
