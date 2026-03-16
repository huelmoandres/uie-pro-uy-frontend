import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Pressable, Text, TextInput, View, Modal } from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useExpedientes, useDebounce, usePinExpediente } from "@hooks";
import {
  Search,
  RefreshCw,
  FolderOpen,
  SlidersHorizontal,
  Plus,
  Calendar as CalendarIcon,
  Star,
  GitCompare,
} from "lucide-react-native";
import { useColorScheme } from "@/components/base/useColorScheme";
import Colors from "@/constants/Colors";
import { Skeleton, PageContainer, Paginator, InfoButton } from "@components/ui";
import { INFO_HINTS } from "@/constants/InfoHints";
import {
  ExpedienteCard,
  FollowExpedienteModal,
  ExpedientesFilterModal,
  AgendaWebView,
  TagPickerModal,
  CreateReminderModal,
} from "@components/features";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import type {
  IExpediente,
  IExpedientesQuery,
} from "@app-types/expediente.types";

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

type TabFilter = "all" | "pinned";

export default function ExpedientesScreen() {
  const colorScheme = useColorScheme();
  const secondaryIconColor = Colors[colorScheme].tabIconDefault;
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedIues, setSelectedIues] = useState<string[]>([]);
  const [showBulkAgenda, setShowBulkAgenda] = useState(false);
  const [queryParams, setQueryParams] = useState<IExpedientesQuery>({
    page: 1,
    limit: 20,
    order: "desc",
    orderBy: "lastSyncAt",
  });
  const [tagPickerIue, setTagPickerIue] = useState<string | null>(null);
  const [reminderModalItem, setReminderModalItem] =
    useState<IExpediente | null>(null);

  const debouncedSearch = useDebounce(searchText, 500);
  const { data, isLoading, isError, refetch, isRefetching } =
    useExpedientes(queryParams);
  const pinMutation = usePinExpediente();

  useEffect(() => {
    setQueryParams((prev) => {
      const newSearch = debouncedSearch.trim() || undefined;
      if (prev.search === newSearch) return prev;
      return { ...prev, search: newSearch, page: 1 };
    });
  }, [debouncedSearch]);

  const handleTabChange = useCallback((tab: TabFilter) => {
    setActiveTab(tab);
    setSelectedIues([]);
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      onlyPinned: tab === "pinned" ? true : undefined,
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handlePin = useCallback(
    (iue: string, isPinned: boolean) => {
      pinMutation.mutate({ iue, isPinned });
    },
    [pinMutation],
  );

  const toggleSelection = useCallback((iue: string) => {
    setSelectedIues((prev) => {
      const isSelected = prev.includes(iue);
      if (isSelected) {
        return prev.filter((id) => id !== iue);
      }
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

  const clearSelection = useCallback(() => {
    setSelectedIues([]);
  }, []);

  const handleBulkAgenda = useCallback(() => {
    if (selectedIues.length === 0) return;
    setShowBulkAgenda(true);
  }, [selectedIues]);

  const canCompare =
    selectedIues.length >= 2 && selectedIues.length <= 3;
  const handleCompare = useCallback(() => {
    if (!canCompare) return;
    const iuesParam = selectedIues.join(",");
    router.push({
      pathname: "/expedientes/compare",
      params: { iues: iuesParam },
    });
  }, [canCompare, selectedIues]);

  // Sort pinned items first within the current page
  const expedientes = useMemo(() => {
    const raw = data?.data ?? [];
    return [...raw].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [data?.data]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Premium Header */}
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
              Mi Monitor
            </Text>
            <Text className="text-[22px] font-sans-bold text-slate-900 dark:text-white mt-0.5">
              Expedientes
            </Text>
          </View>
          <InfoButton
            title={INFO_HINTS.expedientesList.title}
            description={INFO_HINTS.expedientesList.description}
            size={18}
          />
        </View>

        {/* Search & Filter & Add bar */}
        <View className="mt-5 flex-row gap-2.5">
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
            className="h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-sm shadow-accent/20 active:scale-[0.95]"
            onPress={() => setShowFollowModal(true)}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-[0.95] relative"
            onPress={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal size={18} color="#64748B" />
            {queryParams.sede ||
            queryParams.anio ||
            queryParams.tagIds?.length ? (
              <View className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger border border-white dark:border-primary" />
            ) : null}
          </Pressable>
        </View>

        {/* Todos / Favoritos tabs */}
        <View className="mt-4 flex-row items-center gap-2">
          <Pressable
            onPress={() => handleTabChange("all")}
            className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 border active:opacity-70 ${
              activeTab === "all"
                ? "bg-primary border-primary"
                : "bg-transparent border-slate-200 dark:border-white/10"
            }`}
          >
            <Text
              className={`text-[12px] font-sans-semi ${activeTab === "all" ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              Todos
            </Text>
            {data?.meta?.totalItems !== undefined && activeTab === "all" && (
              <View className="bg-white/20 rounded-full px-1.5 py-0.5">
                <Text className="text-[10px] font-sans-bold text-white">
                  {data.meta.totalItems}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => handleTabChange("pinned")}
            className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 border active:opacity-70 ${
              activeTab === "pinned"
                ? "bg-accent border-accent"
                : "bg-transparent border-slate-200 dark:border-white/10"
            }`}
          >
            <Star
              size={11}
              color={activeTab === "pinned" ? "#FFFFFF" : "#B89146"}
              fill={activeTab === "pinned" ? "#FFFFFF" : "transparent"}
            />
            <Text
              className={`text-[12px] font-sans-semi ${activeTab === "pinned" ? "text-white" : "text-accent"}`}
            >
              Favoritos
            </Text>
            {data?.meta?.totalItems !== undefined && activeTab === "pinned" && (
              <View className="bg-white/20 rounded-full px-1.5 py-0.5">
                <Text className="text-[10px] font-sans-bold text-white">
                  {data.meta.totalItems}
                </Text>
              </View>
            )}
          </Pressable>
          <InfoButton
            title={INFO_HINTS.todosFavoritos.title}
            description={INFO_HINTS.todosFavoritos.description}
            size={14}
          />
        </View>
      </View>

      {/* Content */}
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
            {activeTab === "pinned" ? (
              <>
                <Star size={48} color="#B89146" fill="transparent" />
                <Text className="mt-4 font-sans-semi text-slate-500">
                  No tenés favoritos
                </Text>
                <Text className="mt-2 text-[12px] font-sans text-slate-400 text-center px-8">
                  Presioná la estrella ★ en un expediente para marcarlo como
                  favorito
                </Text>
              </>
            ) : (
              <>
                <FolderOpen size={48} color="#94A3B8" />
                <Text className="mt-4 font-sans-semi text-slate-500">
                  No hay expedientes
                </Text>
                <Text className="mt-2 text-[12px] font-sans text-slate-400">
                  Presioná el botón + para agregar uno
                </Text>
              </>
            )}
          </View>
        ) : (
          <FlashList
            data={expedientes}
            keyExtractor={(item: IExpediente) => item.iue}
            extraData={selectedIues}
            renderItem={({ item }: { item: IExpediente }) => (
              <ExpedienteCard
                item={item}
                isSelected={selectedIues.includes(item.iue)}
                isSelectionMode={selectedIues.length > 0}
                onSelect={toggleSelection}
                onPin={handlePin}
                onTagsPress={
                  selectedIues.length === 0 ? setTagPickerIue : undefined
                }
                onAddReminder={
                  selectedIues.length === 0 ? setReminderModalItem : undefined
                }
              />
            )}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 0 }}
            onRefresh={handleRefresh}
            refreshing={isRefetching}
          />
        )}
      </PageContainer>

      {/* Selection Bar & Paginator Container */}
      <View className="bg-white dark:bg-primary border-t border-slate-200/60 dark:border-white/10 z-10 px-5 pt-3 pb-4">
        {selectedIues.length > 0 ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-7 min-w-[28px] items-center justify-center rounded-lg bg-accent px-2 shadow-sm shadow-accent/20">
                  <Text className="font-sans-bold text-[11px] text-white">
                    {selectedIues.length}
                  </Text>
                </View>
                <Text className="font-sans-semi text-[12px] text-slate-600 dark:text-slate-300">
                  {selectedIues.length === 1 ? "Seleccionado" : "Seleccionados"}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                {canCompare && (
                  <Pressable
                    onPress={handleCompare}
                    accessibilityLabel="Comparar expedientes"
                    className="h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-white/15 dark:bg-white/5 active:scale-[0.95]"
                  >
                    <GitCompare size={16} color="#64748B" />
                  </Pressable>
                )}
                <Pressable
                  onPress={handleBulkAgenda}
                  accessibilityLabel="Agendar turno"
                  className="h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-sm shadow-accent/20 active:scale-[0.95]"
                >
                  <CalendarIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={clearSelection}
              accessibilityLabel="Desmarcar todo"
              className="self-center active:opacity-60 py-1"
              hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
            >
              <Text className="font-sans-semi text-[10px] text-slate-400 dark:text-slate-500">
                Desmarcar todo
              </Text>
            </Pressable>
          </View>
        ) : (
          data?.meta &&
          expedientes.length > 0 && (
            <View className="pt-1">
              <Paginator
                currentPage={data.meta.currentPage}
                totalPages={data.meta.totalPages}
                pageSize={data.meta.itemsPerPage}
                totalItems={data.meta.totalItems}
                onPageChange={(p) =>
                  setQueryParams((prev) => ({ ...prev, page: p }))
                }
                onPageSizeChange={(s) =>
                  setQueryParams((prev) => ({ ...prev, limit: s, page: 1 }))
                }
              />
            </View>
          )
        )}
      </View>

      {/* Follow Expediente Modal */}
      <FollowExpedienteModal
        visible={showFollowModal}
        onClose={() => setShowFollowModal(false)}
      />

      {/* Filters Modal */}
      <ExpedientesFilterModal
        visible={showFilterModal}
        currentFilters={queryParams}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => setQueryParams({ ...filters, page: 1 })}
      />

      {/* Bulk Agenda Modal */}
      <Modal
        visible={showBulkAgenda}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowBulkAgenda(false)}
      >
        <AgendaWebView
          iues={selectedIues}
          // Use the sede from the first selected expediente
          sede={expedientes.find((e) => e.iue === selectedIues[0])?.sede || ""}
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

      {/* Tag Picker Modal */}
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

      {/* Recordatorio para expediente (fecha fija) */}
      <CreateReminderModal
        visible={reminderModalItem != null}
        onClose={() => setReminderModalItem(null)}
        iue={reminderModalItem?.iue ?? null}
        caratula={reminderModalItem?.caratula ?? null}
      />
    </View>
  );
}
