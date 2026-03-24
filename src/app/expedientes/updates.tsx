import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  useDebounce,
  useExpedientesInfinite,
  usePinExpediente,
  usePremiumGate,
  useTodayMovementsExpedientesInfinite,
  useAnalytics,
} from "@hooks";
import { Bell, Search, SlidersHorizontal } from "lucide-react-native";
import { Skeleton } from "@components/ui";
import {
  AgendaWebView,
  CreateReminderModal,
  ExpedienteSelectionBar,
  ExpedientesContent,
  ExpedientesFilterModal,
  PremiumGateModal,
  TagPickerModal,
} from "@components/features";
import type {
  IExpediente,
  IExpedientesQuery,
} from "@app-types/expediente.types";

type TabFilter = "all" | "pinned";

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
  const params = useLocalSearchParams<{ iues?: string; scope?: string }>();
  const isTodayScope = params.scope === "todayMovements";
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (isTodayScope) {
      trackEvent("today_movements_viewed");
    }
  }, [isTodayScope, trackEvent]);

  const legacyIues = useMemo(() => {
    const raw = params.iues ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [params.iues]);
  const hasLegacyIues = !isTodayScope && legacyIues.length > 0;

  const [searchText, setSearchText] = useState("");
  const activeTab: TabFilter = "all";
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkAgenda, setShowBulkAgenda] = useState(false);
  const [selectedIues, setSelectedIues] = useState<string[]>([]);
  const [queryParams, setQueryParams] = useState<
    Omit<IExpedientesQuery, "page">
  >({
    limit: 20,
    order: "desc",
    orderBy: "lastSyncAt",
  });
  const [tagPickerIue, setTagPickerIue] = useState<string | null>(null);
  const [reminderModalItem, setReminderModalItem] =
    useState<IExpediente | null>(null);
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: debouncedSearch.trim() || undefined,
    }));
  }, [debouncedSearch]);

  const todayQuery = useTodayMovementsExpedientesInfinite(
    {
      ...queryParams,
      search: debouncedSearch.trim() || undefined,
      onlyPinned: undefined,
    },
    { enabled: isTodayScope },
  );

  const legacyQuery = useExpedientesInfinite(
    {
      ...queryParams,
      search: debouncedSearch.trim() || undefined,
      onlyPinned: undefined,
      iues: hasLegacyIues ? legacyIues : undefined,
    },
    { enabled: hasLegacyIues },
  );

  const activeQuery = isTodayScope ? todayQuery : legacyQuery;
  const pinMutation = usePinExpediente();

  const expedientes = useMemo(
    () => activeQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [activeQuery.data?.pages],
  );

  const paginationMeta = useMemo(() => {
    const firstPage = activeQuery.data?.pages[0];
    if (!firstPage) return null;
    return {
      ...firstPage.meta,
      loadedCount: expedientes.length,
    };
  }, [activeQuery.data?.pages, expedientes.length]);

  const hasActiveFilters =
    !!queryParams.sede ||
    !!queryParams.anio ||
    (queryParams.tagIds?.length ?? 0) > 0;
  const canCompare = selectedIues.length >= 2 && selectedIues.length <= 3;

  const handleRefresh = useCallback(() => {
    void activeQuery.refetch();
  }, [activeQuery]);

  const handleLoadMore = useCallback(() => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      void activeQuery.fetchNextPage();
    }
  }, [activeQuery]);

  const handlePin = useCallback(
    (iue: string, isPinned: boolean) => {
      pinMutation.mutate({ iue, isPinned });
    },
    [pinMutation],
  );

  const toggleSelection = useCallback((iue: string) => {
    setSelectedIues((prev) => {
      const isSelected = prev.includes(iue);
      if (isSelected) return prev.filter((id) => id !== iue);
      if (prev.length >= 5) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
        Toast.show({
          type: "info",
          text1: "Límite alcanzado",
          text2: "Solo podés seleccionar hasta 5 expedientes.",
        });
        return prev;
      }
      return [...prev, iue];
    });
  }, []);

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

  const handleGuardedCompare = useCallback(() => {
    if (!hasPremiumAccess) {
      showPremiumModal("compare");
      return;
    }
    if (!canCompare) return;
    router.push({
      pathname: "/expedientes/compare",
      params: { iues: selectedIues.join(",") },
    });
  }, [hasPremiumAccess, showPremiumModal, canCompare, selectedIues]);

  const handleGuardedBulkAgenda = useCallback(() => {
    if (!hasPremiumAccess) {
      showPremiumModal("agenda");
      return;
    }
    if (selectedIues.length === 0) return;
    setShowBulkAgenda(true);
  }, [hasPremiumAccess, selectedIues.length, showPremiumModal]);

  const clearSelection = useCallback(() => {
    setSelectedIues([]);
  }, []);

  // Sin scope ni IUEs: pantalla huérfana, redirigir a expedientes principal
  if (!isTodayScope && legacyIues.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <Bell size={48} color="#94A3B8" />
        <Text className="mt-4 font-sans-semi text-slate-500 text-center px-8">
          No hay novedades para mostrar
        </Text>
        <Text className="mt-2 text-[12px] font-sans text-slate-400 text-center px-12">
          Esta sección muestra los expedientes que tuvieron movimientos hoy.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)" as Href)}
          className="mt-5 rounded-full bg-accent px-6 py-2.5 active:opacity-70"
        >
          <Text className="font-sans-semi text-sm text-white">
            Ir a mis expedientes
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-3 dark:bg-primary dark:border-white/5">
        {/* Subtitle: scope de búsqueda */}
        <View className="mb-2.5 flex-row items-center gap-1.5">
          <Bell size={11} color="#B89146" />
          <Text className="text-[11px] font-sans-semi text-slate-500 dark:text-slate-400">
            {isTodayScope
              ? "Búsqueda y filtros sobre expedientes con movimientos hoy"
              : "Búsqueda y filtros sobre los expedientes de esta notificación"}
          </Text>
        </View>

        <View className="flex-row gap-2.5">
          <View className="flex-1 h-11 flex-row items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5 dark:border-white/10 dark:bg-white/5">
            <Search size={16} color="#94A3B8" />
            <TextInput
              className="flex-1 h-full px-2.5 font-sans text-[14px] text-slate-900 dark:text-white"
              placeholder="Buscar IUE o carátula..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </View>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-[0.95] relative"
            onPress={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal size={18} color="#64748B" />
            {hasActiveFilters ? (
              <View className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger border border-white dark:border-primary" />
            ) : null}
          </Pressable>
        </View>
      </View>

      <ExpedientesContent
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        isRefetching={activeQuery.isRefetching}
        expedientes={expedientes}
        activeTab={activeTab}
        selectedIues={selectedIues}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasNextPage={activeQuery.hasNextPage ?? false}
        isFetchingNextPage={activeQuery.isFetchingNextPage}
        onSelect={toggleSelection}
        onPin={handlePin}
        onTagsPress={handleTagsPress}
        onAddReminder={handleAddReminder}
        hasPremiumAccess={hasPremiumAccess}
        emptyTitle={
          hasActiveFilters || debouncedSearch
            ? "Sin resultados para esta búsqueda"
            : "Sin novedades por ahora"
        }
        emptyDescription={
          hasActiveFilters || debouncedSearch
            ? "Intentá con otros filtros o borrá la búsqueda."
            : isTodayScope
              ? "Hoy no se registraron movimientos en tus expedientes."
              : "No se encontraron novedades para los expedientes de esta notificación."
        }
      />

      <View className="bg-white dark:bg-primary border-t border-slate-200/60 dark:border-white/10 z-10 px-5 pt-3 pb-4">
        <ExpedienteSelectionBar
          selectedCount={selectedIues.length}
          canCompare={canCompare}
          hasPremiumAccess={hasPremiumAccess}
          onCompare={handleGuardedCompare}
          onBulkAgenda={handleGuardedBulkAgenda}
          onClearSelection={clearSelection}
          paginationMeta={paginationMeta}
          onLoadMore={handleLoadMore}
          hasNextPage={activeQuery.hasNextPage ?? false}
          isFetchingNextPage={activeQuery.isFetchingNextPage}
          hasExpedientes={expedientes.length > 0}
        />
      </View>

      <ExpedientesFilterModal
        visible={showFilterModal}
        currentFilters={queryParams}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) =>
          setQueryParams((prev) => ({
            ...prev,
            ...filters,
          }))
        }
        hasPremiumAccess={hasPremiumAccess}
        onPremiumTagsRequired={() => {
          setShowFilterModal(false);
          showPremiumModal("tags");
        }}
      />

      <Modal
        visible={showBulkAgenda}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowBulkAgenda(false)}
      >
        <AgendaWebView
          iues={selectedIues}
          sede={expedientes.find((e) => e.iue === selectedIues[0])?.sede ?? ""}
          onClose={() => setShowBulkAgenda(false)}
          onBookingComplete={(payload) => {
            setShowBulkAgenda(false);
            if (payload.success) {
              clearSelection();
              Toast.show({
                type: "success",
                text1: "¡Turno agendado!",
                text2: "Tu turno múltiple fue registrado exitosamente.",
              });
            }
          }}
        />
      </Modal>

      <TagPickerModal
        visible={!!tagPickerIue}
        iue={tagPickerIue ?? ""}
        assignedTagIds={
          expedientes
            .find((e) => e.iue === tagPickerIue)
            ?.tags?.map((t) => t.id) ?? []
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
