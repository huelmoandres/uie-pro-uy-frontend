import React, { useMemo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useExpedientes, usePinExpediente, usePremiumGate } from "@hooks";
import { RefreshCw, FolderOpen } from "lucide-react-native";
import { Skeleton, PageContainer } from "@components/ui";
import {
  ExpedienteCard,
  TagPickerModal,
  CreateReminderModal,
  PremiumGateModal,
} from "@components/features";
import type { IExpediente } from "@app-types/expediente.types";

export function ExpedienteSkeleton() {
  return (
    <View className="mb-4 overflow-hidden rounded-[28px] bg-white p-6 border border-slate-100 shadow-premium dark:bg-slate-900/40 dark:border-white/5">
      <View className="flex-row items-center mb-4">
        <Skeleton width={48} height={48} borderRadius={16} />
        <View className="ml-4">
          <Skeleton width={100} height={12} className="mb-2" />
          <Skeleton width={150} height={16} />
        </View>
      </View>
      <Skeleton width="100%" height={40} borderRadius={12} className="mb-4" />
      <View className="flex-row justify-between">
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}

/**
 * Pantalla que muestra únicamente los expedientes con novedades recientes.
 * Llegada desde push coalescido: el payload incluye iues y route /expedientes/updates.
 */
export default function ExpedientesUpdatesScreen() {
  const {
    hasAccess: hasPremiumAccess,
    showPremiumModal,
    showModal: showPremiumGateModal,
    featureParam,
    hidePremiumModal,
  } = usePremiumGate();
  const params = useLocalSearchParams<{ iues?: string }>();
  const iues = useMemo(() => {
    const raw = params.iues ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [params.iues]);

  const [tagPickerIue, setTagPickerIue] = React.useState<string | null>(null);
  const [reminderModalItem, setReminderModalItem] =
    React.useState<IExpediente | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useExpedientes({
    iues: iues.length > 0 ? iues : undefined,
    page: 1,
    limit: 50,
    orderBy: "lastSyncAt",
    order: "desc",
  });
  const pinMutation = usePinExpediente();

  const expedientes = data?.data ?? [];

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handlePin = useCallback(
    (iue: string, isPinned: boolean) => {
      pinMutation.mutate({ iue, isPinned });
    },
    [pinMutation],
  );

  const handleTagsPress = useCallback(
    (iue: string | null) => {
      if (!iue) return;
      if (!hasPremiumAccess) {
        showPremiumModal("tags");
        return;
      }
      setTagPickerIue(iue);
    },
    [hasPremiumAccess, showPremiumModal],
  );

  const handleAddReminder = useCallback(
    (item: IExpediente | null) => {
      if (!item) return;
      if (!hasPremiumAccess) {
        showPremiumModal("reminders");
        return;
      }
      setReminderModalItem(item);
    },
    [hasPremiumAccess, showPremiumModal],
  );

  // Sin IUEs en la URL: ir a la lista principal
  if (iues.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <FolderOpen size={48} color="#94A3B8" />
        <Text className="mt-4 font-sans-semi text-slate-500">
          No hay expedientes para mostrar
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)" as any)}
          className="mt-4 rounded-full bg-accent px-6 py-2.5"
        >
          <Text className="font-sans-semi text-sm text-white">
            Ver todos los expedientes
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <PageContainer withHeader={true}>
        {isLoading ? (
          <View className="flex-1 pt-6">
            {[1, 2, 3, 4].map((id) => (
              <ExpedienteSkeleton key={id} />
            ))}
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center pt-20">
            <RefreshCw size={40} color="#EF4444" />
            <Text className="mt-4 font-sans-bold text-slate-900 dark:text-white">
              Error al cargar
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="mt-4 rounded-full bg-slate-200 px-6 py-2"
            >
              <Text className="text-xs font-sans-bold text-slate-900">
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : expedientes.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <FolderOpen size={48} color="#94A3B8" />
            <Text className="mt-4 font-sans-semi text-slate-500">
              No se encontraron expedientes
            </Text>
            <Pressable
              onPress={() => router.replace("/(tabs)" as any)}
              className="mt-4 rounded-full bg-accent px-6 py-2.5"
            >
              <Text className="font-sans-semi text-sm text-white">
                Ver todos los expedientes
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={expedientes}
            keyExtractor={(item: IExpediente) => item.iue}
            renderItem={({ item }: { item: IExpediente }) => (
              <ExpedienteCard
                item={item}
                isSelected={false}
                isSelectionMode={false}
                onSelect={() => {}}
                onPin={handlePin}
                onTagsPress={handleTagsPress}
                onAddReminder={handleAddReminder}
                hasPremiumAccess={hasPremiumAccess}
              />
            )}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
            onRefresh={handleRefresh}
            refreshing={isRefetching}
          />
        )}
      </PageContainer>

      <TagPickerModal
        visible={!!tagPickerIue}
        iue={tagPickerIue ?? ""}
        assignedTagIds={
          expedientes.find((e) => e.iue === tagPickerIue)?.tags?.map((t) => t.id) ?? []
        }
        onClose={() => setTagPickerIue(null)}
      />

      <CreateReminderModal
        visible={reminderModalItem != null}
        onClose={() => setReminderModalItem(null)}
        iue={reminderModalItem?.iue ?? null}
        caratula={reminderModalItem?.caratula ?? null}
      />

      <PremiumGateModal
        visible={showPremiumGateModal}
        onClose={hidePremiumModal}
        feature={featureParam}
      />
    </View>
  );
}
