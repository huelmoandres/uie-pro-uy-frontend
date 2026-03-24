import React, { useState, useCallback, useEffect } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import {
  Search,
  RefreshCw,
  MapPin,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react-native";
import { PageContainer, Paginator, Skeleton, InfoButton } from "@components/ui";
import { INFO_HINTS } from "@/constants/InfoHints";
import { VenueCard, SedesFilterModal } from "@components/features";
import { useVenues, useVenuesFilters, useDebounce } from "@hooks";
import type { IVenue, IVenuesQuery } from "@app-types/venue.types";
import { COLORS } from "@/constants/Colors";

function VenueSkeleton() {
  return (
    <View className="mb-4 overflow-hidden rounded-[24px] bg-white p-4 border border-slate-100 shadow-premium dark:bg-slate-900/40 dark:border-white/5">
      <View className="flex-row items-start justify-between mb-3">
        <Skeleton width={180} height={16} borderRadius={8} />
        <Skeleton width={60} height={20} borderRadius={8} />
      </View>
      <Skeleton width="100%" height={12} borderRadius={6} className="mb-3" />
      <View className="flex-row gap-2">
        <Skeleton width={60} height={32} borderRadius={12} />
        <Skeleton width={60} height={32} borderRadius={12} />
      </View>
    </View>
  );
}

export default function SedesScreen() {
  const [searchText, setSearchText] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [queryParams, setQueryParams] = useState<IVenuesQuery>({
    page: 1,
    limit: 20,
  });

  const debouncedSearch = useDebounce(searchText, 500);
  const { data, isLoading, isError, refetch, isRefetching } =
    useVenues(queryParams);
  const { data: filtersData } = useVenuesFilters();

  useEffect(() => {
    setQueryParams((prev) => {
      const newSearch = debouncedSearch.trim() || undefined;
      if (prev.search === newSearch) return prev;
      return { ...prev, search: newSearch, page: 1 };
    });
  }, [debouncedSearch]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const hasActiveFilters =
    queryParams.departmentId ||
    queryParams.cityId ||
    queryParams.subjectId ||
    (queryParams.search?.length ?? 0) > 0;

  const venues = data?.data ?? [];

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-95"
          >
            <ArrowLeft size={20} color={COLORS.slate[500]} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
              Directorio
            </Text>
            <Text className="text-[22px] font-sans-bold text-slate-900 dark:text-white mt-0.5">
              Sedes Judiciales
            </Text>
          </View>
          <InfoButton
            title={INFO_HINTS.sedes.title}
            description={INFO_HINTS.sedes.description}
            size={18}
          />
        </View>

        <View className="mt-5 flex-row gap-2.5">
          <View className="flex-1 h-11 flex-row items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5 dark:border-white/10 dark:bg-white/5">
            <Search size={16} color={COLORS.slate[400]} />
            <TextInput
              className="flex-1 h-full px-2.5 font-sans text-[14px] text-slate-900 dark:text-white"
              placeholder="Buscar por nombre o dirección..."
              placeholderTextColor={COLORS.slate[400]}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </View>
          <Pressable
            className={`h-11 w-11 items-center justify-center rounded-xl active:scale-[0.95] ${
              hasActiveFilters ? "bg-accent" : "bg-slate-100 dark:bg-white/10"
            }`}
            onPress={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal
              size={18}
              color={hasActiveFilters ? COLORS.white : COLORS.slate[500]}
              strokeWidth={hasActiveFilters ? 2.5 : 2}
            />
          </Pressable>
        </View>
      </View>

      <PageContainer withHeader={true}>
        {isLoading ? (
          <View className="flex-1 pt-6">
            {[1, 2, 3, 4, 5].map((id) => (
              <VenueSkeleton key={id} />
            ))}
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center pt-20">
            <RefreshCw size={40} color={COLORS.danger} />
            <Text className="mt-4 font-sans-bold text-slate-900 dark:text-white">
              Error al cargar
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="mt-4 rounded-full bg-slate-200 px-6 py-2 dark:bg-white/10"
            >
              <Text className="text-xs font-sans-bold text-slate-900 dark:text-white">
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : venues.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <MapPin size={48} color={COLORS.slate[400]} />
            <Text className="mt-4 font-sans-semi text-slate-500 dark:text-slate-400">
              No hay sedes
            </Text>
            <Text className="mt-2 text-[12px] font-sans text-slate-400 text-center px-8">
              Ajustá los filtros o la búsqueda para ver resultados
            </Text>
          </View>
        ) : (
          <FlashList
            data={venues}
            keyExtractor={(item: IVenue) => item.id}
            renderItem={({ item }: { item: IVenue }) => (
              <VenueCard venue={item} />
            )}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 0 }}
            onRefresh={handleRefresh}
            refreshing={isRefetching}
          />
        )}
      </PageContainer>

      {data?.meta && venues.length > 0 && (
        <View className="bg-white dark:bg-primary border-t border-slate-200/60 dark:border-white/10 px-5 pt-3 pb-4">
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
      )}

      <SedesFilterModal
        visible={showFilterModal}
        currentFilters={queryParams}
        filtersData={filtersData}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) =>
          setQueryParams((prev) => ({
            ...prev,
            page: filters.page ?? 1,
            limit: filters.limit ?? prev.limit ?? 20,
            departmentId: filters.departmentId,
            cityId: filters.cityId,
            subjectId: filters.subjectId,
            search: filters.search,
          }))
        }
      />
    </View>
  );
}
