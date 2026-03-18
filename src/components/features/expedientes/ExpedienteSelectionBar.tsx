import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Calendar as CalendarIcon, GitCompare } from "lucide-react-native";
import { COLORS } from "@/constants/Colors";

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  loadedCount?: number;
}

interface ExpedienteSelectionBarProps {
  selectedCount: number;
  canCompare: boolean;
  onCompare: () => void;
  onBulkAgenda: () => void;
  onClearSelection: () => void;
  paginationMeta?: PaginationMeta | null;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  hasExpedientes: boolean;
}

export function ExpedienteSelectionBar({
  selectedCount,
  canCompare,
  onCompare,
  onBulkAgenda,
  onClearSelection,
  paginationMeta,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  hasExpedientes,
}: ExpedienteSelectionBarProps) {
  if (selectedCount > 0) {
    return (
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-7 min-w-[28px] items-center justify-center rounded-lg bg-accent px-2 shadow-sm shadow-accent/20">
              <Text className="font-sans-bold text-[11px] text-white">
                {selectedCount}
              </Text>
            </View>
            <Text className="font-sans-semi text-[12px] text-slate-600 dark:text-slate-300">
              {selectedCount === 1 ? "Seleccionado" : "Seleccionados"}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {canCompare && (
              <Pressable
                onPress={onCompare}
                accessibilityLabel="Comparar expedientes"
                className="h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-white/15 dark:bg-white/5 active:scale-[0.95]"
              >
                <GitCompare size={16} color="#64748B" />
              </Pressable>
            )}
            <Pressable
              onPress={onBulkAgenda}
              accessibilityLabel="Agendar turno"
              className="h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-sm shadow-accent/20 active:scale-[0.95]"
            >
              <CalendarIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={onClearSelection}
          accessibilityLabel="Desmarcar todo"
          className="self-center active:opacity-60 py-1"
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <Text className="font-sans-semi text-[10px] text-slate-400 dark:text-slate-500">
            Desmarcar todo
          </Text>
        </Pressable>
      </View>
    );
  }

  if (paginationMeta && hasExpedientes) {
    const loadedCount = paginationMeta.loadedCount ?? paginationMeta.totalItems;
    const showLoadMore =
      hasNextPage && onLoadMore && !isFetchingNextPage;

    return (
      <View className="pt-1 gap-2">
        <Text className="text-[11px] font-sans-semi text-slate-400 tracking-wider">
          Mostrando{" "}
          <Text className="font-sans-bold text-slate-600 dark:text-slate-300">
            {loadedCount}
          </Text>{" "}
          de{" "}
          <Text className="font-sans-bold text-slate-600 dark:text-slate-300">
            {paginationMeta.totalItems}
          </Text>{" "}
          expedientes
        </Text>
        {showLoadMore && (
          <Pressable
            onPress={onLoadMore}
            className="flex-row items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 dark:bg-white/5 active:opacity-70"
            accessibilityLabel="Cargar más expedientes"
          >
            <Text className="text-[12px] font-sans-semi text-slate-600 dark:text-slate-300">
              Cargar más
            </Text>
          </Pressable>
        )}
        {isFetchingNextPage && (
          <View className="flex-row items-center justify-center gap-2 py-2">
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text className="text-[11px] font-sans text-slate-500">
              Cargando...
            </Text>
          </View>
        )}
      </View>
    );
  }

  return null;
}
