import React, { useState, useMemo, useCallback } from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useExpedienteDetail } from '@hooks';
import { ExpedienteService } from '@services';
import { ConfirmationModal, Skeleton, PageContainer } from '@components/ui';
import { MovementItem } from '@components/features';
import { ScrollView } from 'react-native';
import {
    Trash2,
    ChevronLeft,
    RefreshCw,
    Scale,
    Calendar,
    MapPin,
    Info,
    History,
    FileText,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { stripHtml } from '@utils/formatters';

/**
 * Premium Expediente Detail Screen
 * Uses new design tokens and glassmorphism for a high-end feel.
 */
export default function ExpedienteDetailScreen() {
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams();
    const [showUnfollowModal, setShowUnfollowModal] = useState(false);

    // Movements: filter + pagination state
    const [decreeFilter, setDecreeFilter] = useState<'all' | 'decree' | 'no-decree'>('all');
    const [yearFilter, setYearFilter] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Route uses ':' as separator (e.g. 40-91:2018) to avoid URL encoding issues.
    // The API expects the original slash format: 40-91/2018.
    const iue = (id as string).replace(':', '/');

    const { data, isLoading, isError, refetch, isRefetching } = useExpedienteDetail(iue);

    const handleUnfollow = async () => {
        setShowUnfollowModal(false);
        try {
            await ExpedienteService.unfollow(id as string);

            // Invalidate the lists to ensure the main screen remains in sync
            void queryClient.invalidateQueries({
                queryKey: ExpedienteService.queryKeys.lists(),
            });

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Dejaste de seguir este expediente.',
            });
            router.back();
        } catch {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo realizar la acción. Intentá de nuevo.',
            });
        }
    };

    // Extract unique years from movements for the year filter chips
    const availableYears = useMemo(() => {
        if (!data) return [];
        const years = new Set(
            data.movements.map((m) => new Date(m.fecha).getFullYear())
        );
        return Array.from(years).sort((a, b) => b - a);
    }, [data]);

    // Apply decree + year filters
    const filteredMovements = useMemo(() => {
        if (!data) return [];
        return data.movements.filter((m) => {
            const hasDecree = m.decree !== null;
            const matchesDecreeFilter =
                decreeFilter === 'all'
                    ? true
                    : decreeFilter === 'decree'
                        ? hasDecree
                        : !hasDecree;
            const matchesYear =
                yearFilter === null
                    ? true
                    : new Date(m.fecha).getFullYear() === yearFilter;
            return matchesDecreeFilter && matchesYear;
        });
    }, [data, decreeFilter, yearFilter]);

    // Paginated slice
    const paginatedMovements = useMemo(
        () => filteredMovements.slice(0, page * PAGE_SIZE),
        [filteredMovements, page]
    );

    const handleFilterChange = useCallback(
        (decree: typeof decreeFilter, year: number | null) => {
            setDecreeFilter(decree);
            setYearFilter(year);
            setPage(1); // reset page when filter changes
        },
        []
    );

    const handleRefresh = () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        void refetch();
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark p-6 pt-20">
                <Skeleton width="40%" height={24} className="mb-6" />
                <Skeleton width="100%" height={180} borderRadius={28} className="mb-6" />
                <Skeleton width="90%" height={16} className="mb-4" />
                <Skeleton width="80%" height={16} className="mb-4" />
            </View>
        );
    }

    if (isError || !data) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-10">
                <Info size={40} color="#EF4444" />
                <Text className="mt-4 text-lg font-sans-bold text-slate-900 dark:text-white">No encontrado</Text>
                <Text className="mt-2 text-center font-sans text-xs text-slate-500">
                    No pudimos obtener la información de este expediente. Es posible que ya no exista.
                </Text>
                <Pressable
                    className="mt-8 rounded-full bg-primary px-6 py-3 dark:bg-accent"
                    onPress={() => router.back()}
                >
                    <Text className="font-sans-bold text-white dark:text-primary-dark uppercase tracking-widest text-[10px]">Volver</Text>
                </Pressable>
            </View>
        );
    }

    const item = data;

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Premium Sticky Header */}
            <View className="z-10 border-b border-slate-100 bg-white/80 px-4 pb-4 pt-14 backdrop-blur-3xl dark:border-white/5 dark:bg-primary/80">
                <View className="flex-row items-center justify-between">
                    <Pressable
                        className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 active:scale-90"
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={20} color="#B89146" />
                    </Pressable>
                    <View className="items-center">
                        <Text className="text-[9px] font-sans-bold uppercase tracking-[2px] text-slate-400">
                            Detalle Judicial
                        </Text>
                        <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">{item.iue}</Text>
                    </View>
                    <View className="flex-row gap-2">
                        <Pressable
                            className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 active:scale-90"
                            onPress={handleRefresh}
                        >
                            <RefreshCw size={18} color={isRefetching ? '#B89146' : '#64748B'} />
                        </Pressable>
                    </View>
                </View>
            </View>

            <PageContainer scrollable={true} withHeader={true} className="pt-6">
                {/* Main Info Card */}
                <View className="mb-6 overflow-hidden rounded-[32px] bg-white p-6 border border-slate-100 shadow-premium dark:bg-primary/50 dark:border-white/5 dark:shadow-premium-dark">
                    <View className="mb-5 flex-row items-center">
                        <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-slate-50 dark:bg-primary shadow-sm border border-slate-100 dark:border-white/5">
                            <Scale size={28} color="#B89146" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-[10px] font-sans-bold uppercase tracking-[1px] text-accent">
                                Expediente {item.anio}
                            </Text>
                            <Text className="text-lg font-sans-bold text-slate-900 dark:text-white leading-tight">
                                {item.iue}
                            </Text>
                        </View>
                    </View>

                    <Text className="mb-6 font-sans-semi text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {stripHtml(item.caratula) || 'Sin carátula registrada en el sistema.'}
                    </Text>

                    <View className="mb-4 flex-row items-center bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl">
                        <MapPin size={14} color="#B89146" />
                        <Text className="ml-3 font-sans-semi text-[13px] text-slate-600 dark:text-slate-400 flex-1">{item.sede}</Text>
                    </View>

                    <View className="flex-row items-center bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl">
                        <Calendar size={14} color="#B89146" />
                        <Text className="ml-3 font-sans text-[13px] text-slate-500">
                            Activo desde <Text className="font-sans-bold text-slate-700 dark:text-slate-300">{item.anio}</Text>
                        </Text>
                    </View>
                </View>

                {/* Vertical Timeline Preview (Refined Stats) */}
                <View className="mb-8 flex-row gap-4">
                    <View className="flex-1 rounded-[24px] bg-white p-5 border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/5">
                        <View className="flex-row items-center mb-2">
                            <History size={14} color="#B89146" className="mr-2" />
                            <Text className="text-[10px] font-sans-bold uppercase tracking-[1px] text-slate-400">
                                Movimientos
                            </Text>
                        </View>
                        <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white">{item.totalMovimientos}</Text>
                    </View>
                    <View className="flex-1 rounded-[24px] bg-white p-5 border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/5">
                        <View className="flex-row items-center mb-2">
                            <View className="h-2 w-2 rounded-full bg-success mr-2" />
                            <Text className="text-[10px] font-sans-bold uppercase tracking-[1px] text-slate-400">
                                Estado
                            </Text>
                        </View>
                        <Text className="text-2xl font-sans-bold text-success">Activo</Text>
                    </View>
                </View>

                {/* ── Movements Timeline ──────────────────────────────── */}
                <View className="mb-8">
                    {/* Section header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400">
                            Historial de Movimientos
                        </Text>
                        <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                            <History size={10} color="#94A3B8" />
                            <Text className="text-[10px] font-sans-semi text-slate-400">
                                {filteredMovements.length} / {item.totalMovimientos}
                            </Text>
                        </View>
                    </View>

                    {/* ── Filter chips ── */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 6, paddingBottom: 14 }}
                    >
                        {(
                            [
                                { key: 'all', label: 'Todos' },
                                { key: 'decree', label: 'Con decreto' },
                                { key: 'no-decree', label: 'Sin decreto' },
                            ] as const
                        ).map(({ key, label }) => (
                            <Pressable
                                key={key}
                                onPress={() => handleFilterChange(key, yearFilter)}
                                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${decreeFilter === key
                                    ? 'border-accent bg-accent'
                                    : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                                    }`}
                            >
                                <Text
                                    className={`text-[11px] font-sans-semi ${decreeFilter === key ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        ))}

                        {availableYears.map((year) => (
                            <Pressable
                                key={year}
                                onPress={() =>
                                    handleFilterChange(decreeFilter, yearFilter === year ? null : year)
                                }
                                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${yearFilter === year
                                    ? 'border-primary bg-primary'
                                    : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                                    }`}
                            >
                                <Text
                                    className={`text-[11px] font-sans-semi ${yearFilter === year ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    {year}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* ── List ── */}
                    {item.movements.length === 0 ? (
                        <View className="items-center py-10">
                            <FileText size={36} color="#94A3B8" />
                            <Text className="mt-3 text-sm font-sans-semi text-slate-400">Sin movimientos registrados</Text>
                            <Text className="mt-1 text-[11px] font-sans text-slate-400 text-center">
                                Los movimientos aparecerán aquí una vez sincronizados.
                            </Text>
                        </View>
                    ) : filteredMovements.length === 0 ? (
                        <View className="items-center py-10">
                            <FileText size={36} color="#94A3B8" />
                            <Text className="mt-3 text-sm font-sans-semi text-slate-400">
                                Sin resultados para los filtros seleccionados
                            </Text>
                        </View>
                    ) : (
                        <View className="bg-white dark:bg-primary/50 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-premium dark:shadow-premium-dark px-4 py-3">
                            {paginatedMovements.map((movement, index) => (
                                <MovementItem
                                    key={`${movement.orden}-${index}`}
                                    item={movement}
                                    isFirst={index === 0}
                                    isLast={index === paginatedMovements.length - 1}
                                />
                            ))}

                            {paginatedMovements.length < filteredMovements.length && (
                                <Pressable
                                    className="mt-4 mb-2 items-center justify-center rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 py-3 active:opacity-70"
                                    onPress={() => setPage((p) => p + 1)}
                                >
                                    <Text className="text-[11px] font-sans-semi text-slate-500 dark:text-slate-400">
                                        Ver más ({filteredMovements.length - paginatedMovements.length} restantes)
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>

                <View className="mt-4 pb-12">
                    <Text className="mb-4 ml-1 text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400">
                        Gestión del Expediente
                    </Text>
                    <Pressable
                        className="flex-row items-center justify-between rounded-3xl bg-danger/5 p-5 border border-danger/10 active:bg-danger/10"
                        onPress={() => setShowUnfollowModal(true)}
                    >
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10 mr-4">
                                <Trash2 size={18} color="#EF4444" />
                            </View>
                            <View>
                                <Text className="text-sm font-sans-bold text-danger">Dejar de seguir</Text>
                                <Text className="text-[11px] font-sans text-danger/60">Eliminar de mi monitor personal</Text>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </PageContainer>

            {/* Confirmation Modal */}
            <ConfirmationModal
                visible={showUnfollowModal}
                title="Quitar Expediente"
                description="¿Estás seguro que deseás dejar de seguir este expediente? Perderás el monitoreo en tiempo real."
                confirmText="Sí, quitar"
                cancelText="Mantener"
                type="danger"
                onConfirm={handleUnfollow}
                onCancel={() => setShowUnfollowModal(false)}
            />
        </View>
    );
}
