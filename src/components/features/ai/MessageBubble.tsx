import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Bot, Zap } from "lucide-react-native";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { MarkdownText } from "@components/ui/MarkdownText";
import type { ChatMessage } from "@app-types/ai.types";

interface MessageBubbleProps {
  message: ChatMessage;
}

/** Tarjeta especial cuando el usuario alcanzó el límite diario de mensajes. */
function RateLimitBubble({ message }: { message: ChatMessage }) {
  const meta = message.rateLimitMeta;
  const showUpgrade = meta && !meta.isPro;

  return (
    <View className="flex-row items-end gap-2">
      <View className="w-7 h-7 rounded-full bg-amber-500/10 items-center justify-center mb-0.5">
        <Zap size={14} color="#F59E0B" />
      </View>
      <View className="max-w-[82%] bg-amber-50 dark:bg-amber-900/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-amber-200 dark:border-amber-500/20">
        <MarkdownText
          content={message.content}
          textClass="text-[14px] font-sans text-amber-900 dark:text-amber-200"
        />
        {showUpgrade && (
          <Pressable
            onPress={() => router.push("/paywall?entry=gate&feature=ai-chat")}
            className="mt-3 rounded-xl bg-primary dark:bg-accent py-2 px-4 items-center active:opacity-80"
          >
            <Text className="text-[13px] font-sans-bold text-white">
              Ver planes Pro →
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isRateLimit = message.errorStatus === 429;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className={`px-4 py-1.5 ${isUser ? "items-end" : "items-start"}`}
    >
      {!isUser &&
        (isRateLimit ? (
          <RateLimitBubble message={message} />
        ) : (
          <View className="flex-row items-end gap-2">
            <View className="w-7 h-7 rounded-full bg-primary/10 dark:bg-white/10 items-center justify-center mb-0.5">
              <Bot size={14} color={COLORS.accent} />
            </View>
            <View className="max-w-[82%] bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-white/5">
              <MarkdownText
                content={message.content}
                isStreaming={message.isStreaming}
                textClass="text-[14px] font-sans text-slate-800 dark:text-slate-100"
              />
            </View>
          </View>
        ))}

      {isUser && (
        <View className="max-w-[82%] bg-primary dark:bg-accent/90 rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
          <Text className="text-[14px] font-sans leading-[22px] text-white">
            {message.content}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
