import React, { useState, useCallback, useEffect } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAuth } from '@context/AuthContext';
import { useExpedientes, useDebounce } from '@hooks';
import { Search, LogOut, RefreshCw, FolderOpen, SlidersHorizontal, Plus } from 'lucide-react-native';
import { ConfirmationModal, Skeleton, PageContainer, Paginator } from '@components/ui';
import { ExpedienteCard, FollowExpedienteModal, ExpedientesFilterModal } from '@components/features';
import type { IExpediente, IExpedientesQuery } from '@app-types/expediente.types';

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

export default function ExpedientesScreen() {
  const { signOut } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [queryParams, setQueryParams] = useState<IExpedientesQuery>({
    page: 1,
    limit: 20,
    order: 'desc',
    orderBy: 'lastSyncAt',
  });

  const debouncedSearch = useDebounce(searchText, 500);
  const { data, isLoading, isError, refetch, isRefetching } = useExpedientes(queryParams);

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

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await signOut();
  }, [signOut]);

  const expedientes = data?.data ?? [];

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Premium Header */}
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
              Mi Monitor
            </Text>
            <Text className="text-[22px] font-sans-bold text-slate-900 dark:text-white mt-0.5">
              Expedientes
            </Text>
          </View>
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-[12px] bg-slate-50 dark:bg-white/5 active:scale-[0.9] active:bg-slate-100"
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut size={18} color="#64748B" />
          </Pressable>
        </View>

        {/* Search & Filter bar */}
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
            className="h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-sm shadow-accent/20 active:scale-[0.95] relative"
            onPress={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal size={18} color="#FFFFFF" />
            {(queryParams.sede || queryParams.anio) && (
              <View className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger border border-white dark:border-primary" />
            )}
          </Pressable>
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
            <Text className="mt-4 font-sans-bold text-slate-900 dark:text-white">Error al cargar</Text>
            <Pressable onPress={handleRefresh} className="mt-4 rounded-full bg-slate-200 px-6 py-2">
              <Text className="text-xs font-sans-bold text-slate-900">Reintentar</Text>
            </Pressable>
          </View>
        ) : expedientes.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <FolderOpen size={48} color="#94A3B8" />
            <Text className="mt-4 font-sans-semi text-slate-500">No hay expedientes</Text>
            <Text className="mt-2 text-[12px] font-sans text-slate-400">
              Presioná el botón + para agregar uno
            </Text>
          </View>
        ) : (
          <FlashList
            data={expedientes}
            keyExtractor={(item: IExpediente) => item.iue}
            renderItem={({ item }: { item: IExpediente }) => <ExpedienteCard item={item} />}
            // @ts-ignore
            estimatedItemSize={180}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 0 }}
            onRefresh={handleRefresh}
            refreshing={isRefetching}
          />
        )}
      </PageContainer>

      {/* Fixed Paginator at the bottom */}
      {data?.meta && expedientes.length > 0 && (
        <View className="bg-white dark:bg-primary border-t border-slate-100 dark:border-white/5 pb-2 pt-1 z-10">
          <Paginator
            currentPage={data.meta.currentPage}
            totalPages={data.meta.totalPages}
            pageSize={data.meta.itemsPerPage}
            totalItems={data.meta.totalItems}
            onPageChange={(p) => setQueryParams(prev => ({ ...prev, page: p }))}
            onPageSizeChange={(s) => setQueryParams(prev => ({ ...prev, limit: s, page: 1 }))}
          />
        </View>
      )}

      {/* Floating Action Button */}
      <Pressable
        className={`absolute right-6 h-10 w-10 items-center justify-center rounded-full bg-accent shadow-2xl shadow-black/40 active:scale-[0.92] active:bg-[#8C6D2E] z-20 ${(data?.meta && expedientes.length > 0) ? 'bottom-[120px]' : 'bottom-6'}`}
        onPress={() => setShowFollowModal(true)}
        style={{ elevation: 20 }}
      >
        <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

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

      {/* Logout Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Cerrar Sesión"
        description="¿Estás seguro que deseás salir de tu cuenta?"
        confirmText="Salir"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        type="danger"
      />
    </View>
  );
}
