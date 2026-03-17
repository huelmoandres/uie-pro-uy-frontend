import React from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar as CalendarIcon, GitCompare } from "lucide-react-native";
import { Paginator } from "@components/ui";
import type { IExpedientesQuery } from "@app-types/expediente.types";

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

interface ExpedienteSelectionBarProps {
  selectedCount: number;
  canCompare: boolean;
  onCompare: () => void;
  onBulkAgenda: () => void;
  onClearSelection: () => void;
  paginationMeta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasExpedientes: boolean;
}

export function ExpedienteSelectionBar({
  selectedCount,
  canCompare,
  onCompare,
  onBulkAgenda,
  onClearSelection,
  paginationMeta,
  onPageChange,
  onPageSizeChange,
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
    return (
      <View className="pt-1">
        <Paginator
          currentPage={paginationMeta.currentPage}
          totalPages={paginationMeta.totalPages}
          pageSize={paginationMeta.itemsPerPage}
          totalItems={paginationMeta.totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </View>
    );
  }

  return null;
}
