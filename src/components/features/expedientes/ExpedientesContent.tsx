import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { RefreshCw, Star, FolderOpen } from "lucide-react-native";
import { PageContainer } from "@components/ui";
import { ExpedienteCard } from "@components/features/ExpedienteCard";
import { ExpedienteSkeleton } from "@components/features/ExpedienteSkeleton";
import { EducationalEmptyState } from "@components/shared/EducationalEmptyState";
import { usePendingReminderIues } from "@hooks/usePendingReminderIues";
import type { IExpediente } from "@app-types/expediente.types";
import type { TabFilter } from "@hooks/useExpedientesScreen";
import { COLORS } from "@/constants/Colors";

interface ExpedientesContentProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  expedientes: IExpediente[];
  activeTab: TabFilter;
  selectedIues: string[];
  onRefresh: () => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onAddPress?: () => void;
  onSelect: (iue: string) => void;
  onPin: (iue: string, isPinned: boolean) => void;
  onTagsPress: (iue: string | null) => void;
  onAddReminder: (item: IExpediente | null) => void;
  hasPremiumAccess?: boolean;
  /** Texto del estado vacío (sobreescribe el default) */
  emptyTitle?: string;
  /** Descripción del estado vacío (sobreescribe el default) */
  emptyDescription?: string;
}

export function ExpedientesContent({
  isLoading,
  isError,
  isRefetching,
  expedientes,
  activeTab,
  selectedIues,
  onRefresh,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onAddPress,
  onSelect,
  onPin,
  onTagsPress,
  onAddReminder,
  hasPremiumAccess = true,
  emptyTitle,
  emptyDescription,
}: ExpedientesContentProps) {
  const pendingReminderIues = usePendingReminderIues();

  const renderItem = useCallback(
    ({ item, index }: { item: IExpediente; index: number }) => (
      <ExpedienteCard
        item={item}
        isSelected={selectedIues.includes(item.iue)}
        isSelectionMode={selectedIues.length > 0}
        onSelect={onSelect}
        onPin={onPin}
        onTagsPress={selectedIues.length === 0 ? onTagsPress : undefined}
        onAddReminder={selectedIues.length === 0 ? onAddReminder : undefined}
        showPinTooltip={index === 0}
        hasPremiumAccess={hasPremiumAccess}
        hasPendingReminder={pendingReminderIues.has(item.iue)}
      />
    ),
    [
      selectedIues,
      onSelect,
      onPin,
      onTagsPress,
      onAddReminder,
      hasPremiumAccess,
      pendingReminderIues,
    ],
  );

  const ListFooterComponent = useCallback(() => {
    if (!isFetchingNextPage || !hasNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text className="mt-2 text-[11px] font-sans text-slate-500">
          Cargando más...
        </Text>
      </View>
    );
  }, [isFetchingNextPage, hasNextPage]);

  if (isLoading) {
    return (
      <PageContainer withHeader={true}>
        <View className="flex-1 pt-6">
          {[1, 2, 3, 4].map((id) => (
            <ExpedienteSkeleton key={id} />
          ))}
        </View>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer withHeader={true}>
        <View className="flex-1 items-center justify-center pt-20">
          <RefreshCw size={40} color={COLORS.danger} />
          <Text className="mt-4 font-sans-bold text-slate-900 dark:text-white">
            Error al cargar
          </Text>
          <Pressable
            onPress={onRefresh}
            className="mt-4 rounded-full bg-slate-200 px-6 py-2"
          >
            <Text className="text-xs font-sans-bold text-slate-900">
              Reintentar
            </Text>
          </Pressable>
        </View>
      </PageContainer>
    );
  }

  if (expedientes.length === 0) {
    if (activeTab === "pinned") {
      return (
        <PageContainer withHeader={true}>
          <View className="flex-1 items-center justify-center pt-20">
            <Star size={48} color={COLORS.accent} fill="transparent" />
            <Text className="mt-4 font-sans-semi text-slate-500">
              No tenés favoritos
            </Text>
            <Text className="mt-2 text-[12px] font-sans text-slate-400 text-center px-8">
              Presioná la estrella ★ en un expediente para marcarlo como
              favorito
            </Text>
          </View>
        </PageContainer>
      );
    }

    return (
      <PageContainer withHeader={true}>
        <EducationalEmptyState
          title={emptyTitle ?? "Todavía no seguís ningún expediente"}
          description={
            emptyDescription ??
            "Ingresá un IUE y nosotros nos encargamos de avisarte cuando haya novedades."
          }
          icon={FolderOpen}
          iconColor={COLORS.slate[400]}
          primaryCta={
            onAddPress
              ? {
                  label: "Buscar expediente por IUE",
                  onPress: onAddPress,
                }
              : undefined
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer withHeader={true}>
      <FlashList
        data={expedientes}
        keyExtractor={(item) => item.iue}
        extraData={selectedIues}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 0 }}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        onEndReached={
          hasNextPage && !isFetchingNextPage ? onLoadMore : undefined
        }
        onEndReachedThreshold={0.3}
        ListFooterComponent={ListFooterComponent}
      />
    </PageContainer>
  );
}
