import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Bot, History, Send, Trash2 } from "lucide-react-native";
import { COLORS } from "@/constants/Colors";
import { CHAT_MODES } from "@app-types/ai.types";
import type { ChatMessage, ChatMode } from "@app-types/ai.types";
import { useAiChat } from "@hooks/useAiChat";
import { useAnalytics } from "@hooks/useAnalytics";
import { AiService } from "@services/AiService";
import {
  ChatModeTabs,
  MessageBubble,
  TypingIndicator,
} from "@components/features";
import { bottomInsetPadding } from "@utils/safeAreaLayout";
import { useKeyboardAvoidingViewProps } from "@hooks/useKeyboardAvoidingViewProps";
import { useAndroidKeyboardScroll } from "@hooks/useAndroidKeyboardScroll";

export default function AiChatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId?: string;
    mode?: string;
  }>();

  const [mode, setMode] = useState<ChatMode>(
    (params.mode as ChatMode) ?? "EXPEDIENTE_ASSISTANT",
  );
  const [inputText, setInputText] = useState("");
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const { trackEvent } = useAnalytics();

  const {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    loadConversation,
    clearMessages,
    abort,
  } = useAiChat();

  const activeMode = CHAT_MODES.find((m) => m.mode === mode)!;

  // Cargar conversación existente si se navegó desde el historial
  useEffect(() => {
    if (!params.conversationId) return;

    setIsLoadingConversation(true);
    AiService.getConversation(params.conversationId)
      .then((conversation) => {
        loadConversation(
          conversation.messages,
          conversation.id,
          conversation.mode as ChatMode,
        );
        setMode(conversation.mode as ChatMode);
      })
      .catch(() => {
        // Si falla la carga, simplemente empezar un chat nuevo
      })
      .finally(() => setIsLoadingConversation(false));
    // Solo ejecutar al montar (params.conversationId es estático en esta pantalla)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.conversationId]);

  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText("");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text, mode);
  }, [inputText, isStreaming, mode, sendMessage]);

  const handleClear = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMessages();
  }, [clearMessages]);

  const handleModeChange = useCallback(
    (newMode: ChatMode) => {
      if (newMode === mode) return;
      trackEvent("ai_chat_mode_changed", { from: mode, to: newMode });
      setMode(newMode);
    },
    [mode, trackEvent],
  );

  const handleHistoryPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent("ai_chat_history_opened");
    router.push("/herramientas/ai-chat-history");
  }, [trackEvent]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const scrollChatToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useAndroidKeyboardScroll(scrollChatToEnd, true);

  const keyboardAvoidingProps = useKeyboardAvoidingViewProps("screen");

  if (isLoadingConversation) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-5 pb-3 pt-14 dark:bg-primary dark:border-white/5">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              abort();
              router.back();
            }}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
          >
            <ArrowLeft size={20} color={COLORS.slate[500]} />
          </Pressable>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Bot size={16} color={COLORS.accent} />
              <Text className="text-[16px] font-sans-bold text-slate-900 dark:text-white">
                Asistente IUE
              </Text>
            </View>
            <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
              {activeMode.label}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={handleHistoryPress}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
            >
              <History size={18} color={COLORS.slate[400]} />
            </Pressable>

            {messages.length > 0 && (
              <Pressable
                onPress={handleClear}
                className="h-9 w-9 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
              >
                <Trash2 size={18} color={COLORS.slate[400]} />
              </Pressable>
            )}
          </View>
        </View>

        <ChatModeTabs
          selected={mode}
          onSelect={handleModeChange}
          disabled={isStreaming}
        />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView {...keyboardAvoidingProps} className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pt-16">
              <View className="w-16 h-16 rounded-full bg-primary/8 dark:bg-white/5 items-center justify-center mb-4">
                <Bot size={32} color={COLORS.accent} />
              </View>
              <Text className="text-[16px] font-sans-bold text-slate-700 dark:text-slate-200 text-center">
                ¿En qué te ayudo?
              </Text>
              <Text className="mt-2 text-[13px] font-sans text-slate-400 text-center leading-5">
                {activeMode.description}
              </Text>
            </View>
          }
          ListFooterComponent={
            isStreaming && messages.at(-1)?.content === "" ? (
              <TypingIndicator />
            ) : null
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Disclaimer */}
        {activeMode.disclaimer && (
          <View className="px-5 pb-1">
            <Text className="text-[10px] font-sans text-slate-400 dark:text-slate-500 text-center leading-4">
              {activeMode.disclaimer}
            </Text>
          </View>
        )}

        {/* Conversation ID badge (sutil) */}
        {conversationId && messages.length > 0 && (
          <View className="px-5 pb-1 items-center">
            <Text className="text-[10px] font-sans text-slate-300 dark:text-slate-600">
              Chat guardado automáticamente
            </Text>
          </View>
        )}

        {/* Input bar */}
        <View
          className="flex-row items-end gap-2 border-t border-slate-100 bg-white px-4 pt-3 dark:bg-primary dark:border-white/5"
          style={{ paddingBottom: bottomInsetPadding(insets.bottom, 8) }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => {
              scrollChatToEnd();
              setTimeout(scrollChatToEnd, 120);
              setTimeout(scrollChatToEnd, 280);
            }}
            placeholder={`Preguntá sobre ${activeMode.label.toLowerCase()}...`}
            placeholderTextColor={COLORS.slate[400]}
            multiline
            maxLength={1000}
            editable={!isStreaming}
            onSubmitEditing={handleSend}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-sans text-slate-900 dark:bg-slate-800/60 dark:border-white/10 dark:text-white"
            style={{ maxHeight: 120 }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              inputText.trim() && !isStreaming
                ? "bg-primary dark:bg-accent"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <Send
              size={18}
              color={
                inputText.trim() && !isStreaming
                  ? COLORS.white
                  : COLORS.slate[400]
              }
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
