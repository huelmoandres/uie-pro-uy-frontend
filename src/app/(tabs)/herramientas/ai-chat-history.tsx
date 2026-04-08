import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { AiService } from "@services/AiService";
import { ConfirmationModal } from "@components/ui";
import {
  ArrowLeft,
  Bot,
  Clock,
  MessageSquare,
  Scale,
  Trash2,
} from "lucide-react-native";
import { COLORS } from "@/constants/Colors";
import { scrollContentBottomPadding } from "@utils/safeAreaLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatConversationSummary, ChatMode } from "@app-types/ai.types";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const MODE_META: Record<ChatMode, { label: string; icon: React.ReactNode }> = {
  EXPEDIENTE_ASSISTANT: {
    label: "Mis Expedientes",
    icon: <Bot size={14} color={COLORS.accent} />,
  },
  LEGAL_GENERAL: {
    label: "Consultas Legales",
    icon: <Scale size={14} color="#6366F1" />,
  },
  APP_FAQ: {
    label: "Soporte",
    icon: <MessageSquare size={14} color="#10B981" />,
  },
};

function ConversationItem({
  item,
  onRequestDelete,
}: {
  item: ChatConversationSummary;
  onRequestDelete: (row: ChatConversationSummary) => void;
}) {
  const meta = MODE_META[item.mode as ChatMode] ?? MODE_META.APP_FAQ;

  const timeAgo = formatDistanceToNow(parseISO(item.lastMessageAt), {
    addSuffix: true,
    locale: es,
  });

  const handlePress = () => {
    router.push(
      `/herramientas/ai-chat?conversationId=${item.id}&mode=${item.mode}`,
    );
  };

  return (
    <View className="mx-4 mb-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/8 overflow-hidden">
      <View className="flex-row items-start">
        <Pressable
          onPress={handlePress}
          className="flex-1 px-4 pt-3 pb-3 active:opacity-80"
        >
          <Text
            className="text-[14px] font-sans-bold text-slate-900 dark:text-white leading-5"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.lastMessagePreview ? (
            <Text
              className="text-[12px] font-sans text-slate-500 dark:text-slate-400 mt-1.5 leading-[18px]"
              numberOfLines={2}
            >
              {item.lastMessagePreview}
            </Text>
          ) : null}

          <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1 mt-2.5">
            <View className="flex-row items-center gap-1">
              {meta.icon}
              <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                {meta.label}
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <View className="flex-row items-center gap-1">
              <Clock size={11} color={COLORS.slate[400]} />
              <Text className="text-[11px] font-sans text-slate-400">
                {timeAgo}
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <Text className="text-[11px] font-sans text-slate-400">
              {item.messageCount}{" "}
              {item.messageCount === 1 ? "mensaje" : "mensajes"}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => onRequestDelete(item)}
          className="px-3 pt-3 pb-2 items-center justify-start active:bg-slate-100 dark:active:bg-white/10"
          hitSlop={8}
          accessibilityLabel="Eliminar conversación"
        >
          <Trash2 size={14} color={COLORS.slate[400]} />
        </Pressable>
      </View>
    </View>
  );
}

export default function AiChatHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ChatConversationSummary | null>(null);

  const {
    data: conversations,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["ai-chat-history", user?.id],
    queryFn: () => AiService.listConversations(),
    enabled: !!user?.id,
  });

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleting(id);
      try {
        await AiService.deleteConversation(id);
        await queryClient.invalidateQueries({
          queryKey: ["ai-chat-history", user?.id],
        });
      } finally {
        setDeleting(null);
        setDeleteTarget(null);
      }
    },
    [queryClient, user?.id],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatConversationSummary }) => (
      <View style={{ opacity: deleting === item.id ? 0.4 : 1 }}>
        <ConversationItem
          item={item}
          onRequestDelete={(row) => setDeleteTarget(row)}
        />
      </View>
    ),
    [deleting],
  );

  const keyExtractor = useCallback(
    (item: ChatConversationSummary) => item.id,
    [],
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />

      <ConfirmationModal
        visible={deleteTarget !== null}
        title="Eliminar conversación"
        description="¿Seguro que querés borrar esta conversación? No se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={() => {
          if (deleteTarget) void handleDelete(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
          >
            <ArrowLeft size={20} color={COLORS.slate[500]} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-[18px] font-sans-bold text-slate-900 dark:text-white">
              Historial de chats
            </Text>
            <Text className="text-[12px] font-sans text-slate-400 mt-0.5">
              Deslizá hacia abajo para actualizar · últimas 30
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={conversations ?? []}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: scrollContentBottomPadding(insets.bottom, 20),
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pt-24">
              <View className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 items-center justify-center mb-4">
                <MessageSquare size={28} color={COLORS.slate[400]} />
              </View>
              <Text className="text-[16px] font-sans-bold text-slate-700 dark:text-slate-200 text-center">
                Sin conversaciones aún
              </Text>
              <Text className="mt-2 text-[13px] font-sans text-slate-400 text-center leading-5">
                Iniciá un chat con el asistente y tus conversaciones quedarán
                guardadas acá.
              </Text>
              <Pressable
                onPress={() => router.push("/herramientas/ai-chat")}
                className="mt-6 bg-primary dark:bg-accent px-6 py-3 rounded-full active:opacity-80"
              >
                <Text className="text-[14px] font-sans-bold text-white">
                  Iniciar chat
                </Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}
