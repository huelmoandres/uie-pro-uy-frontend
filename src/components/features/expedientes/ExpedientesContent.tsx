import React from "react";
import { Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { RefreshCw, Star, FolderOpen } from "lucide-react-native";
import { PageContainer } from "@components/ui";
import { ExpedienteCard } from "@components/features/ExpedienteCard";
import { ExpedienteSkeleton } from "@components/features/ExpedienteSkeleton";
import { EducationalEmptyState } from "@components/shared/EducationalEmptyState";
import type { IExpediente } from "@app-types/expediente.types";
import type { TabFilter } from "@hooks/useExpedientesScreen";

interface ExpedientesContentProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  expedientes: IExpediente[];
  activeTab: TabFilter;
  selectedIues: string[];
  onRefresh: () => void;
  onAddPress: () => void;
  onSelect: (iue: string) => void;
  onPin: (iue: string, isPinned: boolean) => void;
  onTagsPress: (iue: string | null) => void;
  onAddReminder: (item: IExpediente | null) => void;
}

export function ExpedientesContent({
  isLoading,
  isError,
  isRefetching,
  expedientes,
  activeTab,
  selectedIues,
  onRefresh,
  onAddPress,
  onSelect,
  onPin,
  onTagsPress,
  onAddReminder,
}: ExpedientesContentProps) {
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
          <RefreshCw size={40} color="#EF4444" />
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
            <Star size={48} color="#B89146" fill="transparent" />
            <Text className="mt-4 font-sans-semi text-slate-500">
              No tenés favoritos
            </Text>
            <Text className="mt-2 text-[12px] font-sans text-slate-400 text-center px-8">
              Presioná la estrella ★ en un expediente para marcarlo como favorito
            </Text>
          </View>
        </PageContainer>
      );
    }

    return (
      <PageContainer withHeader={true}>
        <EducationalEmptyState
          title="Todavía no seguís ningún expediente"
          description="Ingresá un IUE y nosotros nos encargamos de avisarte cuando haya novedades."
          icon={FolderOpen}
          iconColor="#94A3B8"
          primaryCta={{
            label: "Buscar expediente por IUE",
            onPress: onAddPress,
          }}
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
        renderItem={({ item, index }) => (
          <ExpedienteCard
            item={item}
            isSelected={selectedIues.includes(item.iue)}
            isSelectionMode={selectedIues.length > 0}
            onSelect={onSelect}
            onPin={onPin}
            onTagsPress={selectedIues.length === 0 ? onTagsPress : undefined}
            onAddReminder={
              selectedIues.length === 0 ? onAddReminder : undefined
            }
            showPinTooltip={index === 0}
          />
        )}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 0 }}
        onRefresh={onRefresh}
        refreshing={isRefetching}
      />
    </PageContainer>
  );
}
