import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAuth } from '@context/AuthContext';
import { useExpedientes, useDebounce, usePinExpediente } from '@hooks';
import { Search, LogOut, RefreshCw, FolderOpen, SlidersHorizontal, Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import { ConfirmationModal, Skeleton, PageContainer, Paginator } from '@components/ui';
import { ExpedienteCard, FollowExpedienteModal, ExpedientesFilterModal, AgendaWebView } from '@components/features';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
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
  const [selectedIues, setSelectedIues] = useState<string[]>([]);
  const [showBulkAgenda, setShowBulkAgenda] = useState(false);
  const [queryParams, setQueryParams] = useState<IExpedientesQuery>({
    page: 1,
    limit: 20,
    order: 'desc',
    orderBy: 'lastSyncAt',
  });

  const debouncedSearch = useDebounce(searchText, 500);
  const { data, isLoading, isError, refetch, isRefetching } = useExpedientes(queryParams);
  const pinMutation = usePinExpediente();

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

  const handlePin = useCallback((iue: string, isPinned: boolean) => {
    pinMutation.mutate({ iue, isPinned });
  }, [pinMutation]);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await signOut();
  }, [signOut]);

  const toggleSelection = useCallback((iue: string) => {
    setSelectedIues(prev => {
      const isSelected = prev.includes(iue);
      if (isSelected) {
        return prev.filter(id => id !== iue);
      }
      if (prev.length >= 5) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Toast.show({
          type: 'info',
          text1: 'Límite alcanzado',
          text2: 'Solo podés seleccionar hasta 5 expedientes.',
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
            extraData={selectedIues}
            renderItem={({ item }: { item: IExpediente }) => (
              <ExpedienteCard
                item={item}
                isSelected={selectedIues.includes(item.iue)}
                isSelectionMode={selectedIues.length > 0}
                onSelect={toggleSelection}
                onPin={handlePin}
              />
            )}
            // @ts-ignore
            estimatedItemSize={180}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 0 }}
            onRefresh={handleRefresh}
            refreshing={isRefetching}
          />
        )}
      </PageContainer>

      {/* Selection Bar & Paginator Container */}
      <View className="bg-white dark:bg-primary border-t border-slate-200/60 dark:border-white/10 z-10 pb-safe px-5 pt-3">
        {selectedIues.length > 0 ? (
          <View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-accent px-2.5 py-1 rounded-lg mr-3 shadow-sm shadow-accent/20">
                  <Text className="font-sans-bold text-xs text-white">
                    {selectedIues.length}
                  </Text>
                </View>
                <Text className="font-sans-bold text-[13px] text-slate-900 dark:text-white">
                  {selectedIues.length === 1 ? 'Seleccionado' : 'Seleccionados'}
                </Text>
              </View>

              <Pressable
                onPress={handleBulkAgenda}
                className="flex-row items-center gap-2 rounded-xl bg-accent px-6 py-3 shadow-md shadow-accent/20 active:scale-[0.96]"
              >
                <CalendarIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text className="font-sans-bold text-xs uppercase tracking-wider text-white">
                  Agendar
                </Text>
              </Pressable>
            </View>

            <View className="items-center mt-3">
              <Pressable
                onPress={clearSelection}
                className="active:opacity-40 py-2"
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
              >
                <Text className="font-sans-bold text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-slate-500">
                  Desmarcar todo
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          data?.meta && expedientes.length > 0 && (
            <View className="pt-1">
              <Paginator
                currentPage={data.meta.currentPage}
                totalPages={data.meta.totalPages}
                pageSize={data.meta.itemsPerPage}
                totalItems={data.meta.totalItems}
                onPageChange={(p) => setQueryParams(prev => ({ ...prev, page: p }))}
                onPageSizeChange={(s) => setQueryParams(prev => ({ ...prev, limit: s, page: 1 }))}
              />
            </View>
          )
        )}
      </View>

      {/* Floating Action Button */}
      <Pressable
        className={`absolute right-6 h-10 w-10 items-center justify-center rounded-full bg-accent shadow-2xl shadow-black/40 active:scale-[0.92] active:bg-[#8C6D2E] z-20 ${(data?.meta && expedientes.length > 0) ? 'top-[180px]' : 'top-[180px]'}`}
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
          sede={expedientes.find(e => e.iue === selectedIues[0])?.sede || ''}
          onClose={() => setShowBulkAgenda(false)}
          onBookingComplete={(payload) => {
            setShowBulkAgenda(false);
            if (payload.success) {
              clearSelection();
              Toast.show({
                type: 'success',
                text1: '¡Turno agendado!',
                text2: 'Tu turno múltiple fue registrado exitosamente.',
              });
            }
          }}
        />
      </Modal>

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
