import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useExpedientesInfinite } from "./useExpedientes";
import { useDebounce } from "./useDebounce";
import { usePinExpediente } from "./usePinExpediente";
import { useAnalytics } from "./useAnalytics";
import type {
  IExpediente,
  IExpedientesQuery,
} from "@app-types/expediente.types";

export type TabFilter = "all" | "pinned";

const BASE_QUERY: Omit<IExpedientesQuery, "page"> = {
  limit: 20,
  order: "desc",
  orderBy: "lastSyncAt",
};

export function useExpedientesScreen() {
  const { openAddExpediente } = useLocalSearchParams<{
    openAddExpediente?: string;
  }>();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedIues, setSelectedIues] = useState<string[]>([]);
  const [showBulkAgenda, setShowBulkAgenda] = useState(false);
  const [queryParams, setQueryParams] =
    useState<Omit<IExpedientesQuery, "page">>(BASE_QUERY);
  const [tagPickerIue, setTagPickerIue] = useState<string | null>(null);
  const [reminderModalItem, setReminderModalItem] =
    useState<IExpediente | null>(null);
  const { trackEvent } = useAnalytics();
  const hasFiredSearchRef = useRef(false);

  const debouncedSearch = useDebounce(searchText, 500);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpedientesInfinite({
    ...queryParams,
    search: debouncedSearch.trim() || undefined,
  });
  const pinMutation = usePinExpediente();

  useEffect(() => {
    if (openAddExpediente === "1") {
      setShowFollowModal(true);
    }
  }, [openAddExpediente]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    setQueryParams((prev) => {
      const newSearch = trimmed || undefined;
      if (prev.search === newSearch) return prev;
      return { ...prev, search: newSearch };
    });
    // Trackear búsqueda solo si el texto tiene contenido (evita el reset a vacío).
    if (trimmed) {
      hasFiredSearchRef.current = true;
      trackEvent("search_performed", { has_text: true });
    } else if (hasFiredSearchRef.current) {
      hasFiredSearchRef.current = false;
    }
  }, [debouncedSearch, trackEvent]);

  const handleTabChange = useCallback((tab: TabFilter) => {
    setActiveTab(tab);
    setSelectedIues([]);
    setQueryParams((prev) => ({
      ...prev,
      onlyPinned: tab === "pinned" ? true : undefined,
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  const canCompare = selectedIues.length >= 2 && selectedIues.length <= 3;
  const handleCompare = useCallback(() => {
    if (!canCompare) return;
    const iuesParam = selectedIues.join(",");
    router.push({
      pathname: "/expedientes/compare",
      params: { iues: iuesParam },
    });
  }, [canCompare, selectedIues]);

  const expedientes = useMemo(() => {
    const raw = data?.pages.flatMap((p) => p.data) ?? [];
    return [...raw].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [data?.pages]);

  const paginationMeta = useMemo(() => {
    const firstPage = data?.pages[0];
    if (!firstPage) return null;
    const loadedCount = expedientes.length;
    return {
      ...firstPage.meta,
      loadedCount,
    };
  }, [data?.pages, expedientes.length]);

  const hasActiveFilters =
    !!queryParams.sede ||
    !!queryParams.anio ||
    (queryParams.tagIds?.length ?? 0) > 0;

  return {
    // State
    searchText,
    setSearchText,
    activeTab,
    showFollowModal,
    setShowFollowModal,
    showFilterModal,
    setShowFilterModal,
    selectedIues,
    showBulkAgenda,
    setShowBulkAgenda,
    queryParams,
    setQueryParams,
    tagPickerIue,
    setTagPickerIue,
    reminderModalItem,
    setReminderModalItem,
    hasActiveFilters,
    // Data
    expedientes,
    data,
    paginationMeta,
    isLoading,
    isError,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    canCompare,
    // Handlers
    handleTabChange,
    handleRefresh,
    handleLoadMore,
    handlePin,
    toggleSelection,
    clearSelection,
    handleBulkAgenda,
    handleCompare,
  };
}
