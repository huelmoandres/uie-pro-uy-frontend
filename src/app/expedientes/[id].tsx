import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    Pressable,
    Text,
    View,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useExpedienteDetail, useExpedienteNotes } from '@hooks';
import { ExpedienteService } from '@services';
import { ConfirmationModal, Skeleton, PageContainer } from '@components/ui';
import { MovementItem, AgendaWebView, InternalGroupItem, CaseStageBadge, ActivityStatusBadge } from '@components/features';
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
    Users,
    StickyNote,
    Check,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { stripHtml } from '@utils/formatters';
import { isInternalGroup, flattenTimeline, type TimelineEntry } from '@app-types/expediente.types';

export default function ExpedienteDetailScreen() {
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams();
    const [showUnfollowModal, setShowUnfollowModal] = useState(false);
    const [showAgenda, setShowAgenda] = useState(false);

    const iue = (id as string).replace(':', '/');

    const [notesText, setNotesText] = useState<string | null>(null);
    const [notesEditing, setNotesEditing] = useState(false);
    const notesInputRef = useRef<TextInput>(null);

    const { mutation: notesMutation, notes: savedNotes } = useExpedienteNotes(iue);
    // While editing, show the in-progress text; otherwise show what's saved in DB.
    const displayNotes = notesText !== null ? notesText : (savedNotes ?? '');

    const handleSaveNotes = useCallback(() => {
        notesMutation.mutate(displayNotes || null, {
            onSuccess: () => { setNotesEditing(false); setNotesText(null); },
        });
    }, [notesMutation, displayNotes]);

    const handleStartEditNotes = useCallback(() => {
        setNotesEditing(true);
        setTimeout(() => notesInputRef.current?.focus(), 100);
    }, []);

    const [decreeFilter, setDecreeFilter] = useState<'all' | 'decree' | 'no-decree'>('all');
    const [yearFilter, setYearFilter] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const { data, isLoading, isError, refetch, isRefetching } = useExpedienteDetail(iue);

    const handleUnfollow = async () => {
        setShowUnfollowModal(false);
        try {
            await ExpedienteService.unfollow(id as string);
            void queryClient.invalidateQueries({ queryKey: ExpedienteService.queryKeys.lists() });
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Dejaste de seguir este expediente.' });
            router.back();
        } catch {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo realizar la acción. Intentá de nuevo.' });
        }
    };

    const availableYears = useMemo(() => {
        if (!data) return [];
        const flat = flattenTimeline(data.movements);
        const years = new Set(flat.map((m) => new Date(m.fecha).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [data]);

    const filteredMovements = useMemo((): TimelineEntry[] => {
        if (!data) return [];
        const isFiltered = decreeFilter !== 'all' || yearFilter !== null;
        if (!isFiltered) return data.movements;

        return flattenTimeline(data.movements).filter((m) => {
            const matchesDecree =
                decreeFilter === 'all' ? true :
                decreeFilter === 'decree' ? m.decree !== null : m.decree === null;
            const matchesYear =
                yearFilter === null ? true :
                new Date(m.fecha).getFullYear() === yearFilter;
            return matchesDecree && matchesYear;
        });
    }, [data, decreeFilter, yearFilter]);

    const paginatedMovements = useMemo(
        () => filteredMovements.slice(0, page * PAGE_SIZE),
        [filteredMovements, page]
    );

    const individualCount = useMemo(
        () => filteredMovements.reduce((acc, e) => acc + (isInternalGroup(e) ? e.count : 1), 0),
        [filteredMovements]
    );

    const handleFilterChange = useCallback(
        (decree: typeof decreeFilter, year: number | null) => {
            setDecreeFilter(decree);
            setYearFilter(year);
            setPage(1);
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
                    No pudimos obtener la información de este expediente.
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
    const parties = item.parties;
    const stage = item.stage;
    const prediction = item.prediction;

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Sticky Header */}
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
                    <Pressable
                        className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 active:scale-90"
                        onPress={handleRefresh}
                    >
                        <RefreshCw size={18} color={isRefetching ? '#B89146' : '#64748B'} />
                    </Pressable>
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

                    <Text className="mb-4 font-sans-semi text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {stripHtml(item.caratula) || 'Sin carátula registrada en el sistema.'}
                    </Text>

                    {/* Stage + Prediction badges */}
                    {(stage || prediction) && (
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {stage && <CaseStageBadge stage={stage.stage} />}
                            {prediction && <ActivityStatusBadge status={prediction.status} />}
                        </View>
                    )}

                    {/* Parties (plaintiff vs defendant) */}
                    {parties && (parties.plaintiff || parties.defendant) && (
                        <View className="mb-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 p-3">
                            <View className="flex-row items-center mb-2 gap-1.5">
                                <Users size={12} color="#94A3B8" />
                                <Text className="text-[10px] font-sans-bold uppercase tracking-wide text-slate-400">Partes</Text>
                            </View>
                            {parties.plaintiff && (
                                <View className="flex-row gap-2 mb-1">
                                    <Text className="text-[11px] font-sans-bold text-slate-400 w-16">Actor:</Text>
                                    <Text className="text-[11px] font-sans-semi text-slate-600 dark:text-slate-300 flex-1" numberOfLines={1}>{parties.plaintiff}</Text>
                                </View>
                            )}
                            {parties.defendant && (
                                <View className="flex-row gap-2">
                                    <Text className="text-[11px] font-sans-bold text-slate-400 w-16">Demandado:</Text>
                                    <Text className="text-[11px] font-sans-semi text-slate-600 dark:text-slate-300 flex-1" numberOfLines={1}>{parties.defendant}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View className="mb-3 flex-row items-center bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl">
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

                {/* Agenda CTA */}
                <Pressable
                    className="mb-6 flex-row items-center justify-center gap-3 rounded-[20px] border border-accent/30 bg-accent/10 p-4 active:opacity-70"
                    onPress={() => setShowAgenda(true)}
                >
                    <Calendar size={18} color="#B89146" />
                    <Text className="font-sans-bold text-sm text-accent uppercase tracking-widest">
                        Agendar Hora
                    </Text>
                </Pressable>

                {/* Stats row */}
                <View className="mb-8 flex-row gap-4">
                    <View className="flex-1 rounded-[24px] bg-white p-5 border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/5">
                        <View className="flex-row items-center mb-2">
                            <History size={14} color="#B89146" />
                            <Text className="ml-2 text-[10px] font-sans-bold uppercase tracking-[1px] text-slate-400">
                                Movimientos
                            </Text>
                        </View>
                        <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white">{item.totalMovimientos}</Text>
                        {item.stats?.averageDaysBetweenMovements != null && (
                            <Text className="text-[10px] font-sans text-slate-400 mt-1">
                                ~{Math.round(item.stats.averageDaysBetweenMovements)}d entre mov.
                            </Text>
                        )}
                    </View>
                    <View className="flex-1 rounded-[24px] bg-white p-5 border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/5">
                        <View className="flex-row items-center mb-2">
                            <View className="h-2 w-2 rounded-full bg-success mr-2" />
                            <Text className="text-[10px] font-sans-bold uppercase tracking-[1px] text-slate-400">
                                Estado
                            </Text>
                        </View>
                        {prediction ? (
                            <ActivityStatusBadge status={prediction.status} />
                        ) : (
                            <Text className="text-2xl font-sans-bold text-success">Activo</Text>
                        )}
                        {prediction?.daysSinceLastActivity != null && (
                            <Text className="text-[10px] font-sans text-slate-400 mt-1">
                                Último mov. hace {prediction.daysSinceLastActivity}d
                            </Text>
                        )}
                    </View>
                </View>

                {/* ── Movements Timeline ─────────────────────────────── */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400">
                            Historial de Movimientos
                        </Text>
                        <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                            <History size={10} color="#94A3B8" />
                            <Text className="text-[10px] font-sans-semi text-slate-400">
                                {individualCount} / {item.totalMovimientos}
                            </Text>
                        </View>
                    </View>

                    {/* Filter chips */}
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
                                <Text className={`text-[11px] font-sans-semi ${decreeFilter === key ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}

                        {availableYears.map((year) => (
                            <Pressable
                                key={year}
                                onPress={() => handleFilterChange(decreeFilter, yearFilter === year ? null : year)}
                                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${yearFilter === year
                                    ? 'border-primary bg-primary'
                                    : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                                }`}
                            >
                                <Text className={`text-[11px] font-sans-semi ${yearFilter === year ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {year}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* List */}
                    {item.movements.length === 0 ? (
                        <View className="items-center py-10">
                            <FileText size={36} color="#94A3B8" />
                            <Text className="mt-3 text-sm font-sans-semi text-slate-400">Sin movimientos registrados</Text>
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
                            {paginatedMovements.map((entry, index) => {
                                const isFirst = index === 0;
                                const isLast = index === paginatedMovements.length - 1;

                                if (isInternalGroup(entry)) {
                                    return (
                                        <InternalGroupItem
                                            key={`group-${index}`}
                                            group={entry}
                                            isFirst={isFirst}
                                            isLast={isLast}
                                        />
                                    );
                                }

                                return (
                                    <MovementItem
                                        key={`${entry.orden}-${index}`}
                                        item={entry}
                                        isFirst={isFirst}
                                        isLast={isLast}
                                    />
                                );
                            })}

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

                {/* ── Notas personales ──────────────────────────────── */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400">
                            Mis Notas
                        </Text>
                        {!notesEditing ? (
                            <Pressable onPress={handleStartEditNotes} hitSlop={8}>
                                <Text className="text-[11px] font-sans-semi text-accent">Editar</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={handleSaveNotes}
                                disabled={notesMutation.isPending}
                                className="flex-row items-center gap-1 bg-accent/10 rounded-full px-3 py-1"
                            >
                                <Check size={12} color="#B89146" />
                                <Text className="text-[11px] font-sans-semi text-accent">Guardar</Text>
                            </Pressable>
                        )}
                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <Pressable
                            onPress={handleStartEditNotes}
                            className={`rounded-[24px] border p-4 min-h-[80px] ${
                                notesEditing
                                    ? 'border-accent/40 bg-accent/5 dark:bg-accent/10'
                                    : 'border-slate-100 dark:border-white/5 bg-white dark:bg-primary/40'
                            }`}
                        >
                            {notesEditing ? (
                                <TextInput
                                    ref={notesInputRef}
                                    value={displayNotes}
                                    onChangeText={setNotesText}
                                    multiline
                                    placeholder="Agregá notas personales sobre este expediente..."
                                    placeholderTextColor="#94A3B8"
                                    className="font-sans text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed"
                                    style={{ textAlignVertical: 'top', minHeight: 64 }}
                                />
                            ) : displayNotes ? (
                                <Text className="font-sans text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {displayNotes}
                                </Text>
                            ) : (
                                <View className="flex-row items-center gap-2 opacity-50">
                                    <StickyNote size={16} color="#94A3B8" />
                                    <Text className="font-sans text-[13px] text-slate-400">
                                        Sin notas. Tocá Editar para agregar.
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </KeyboardAvoidingView>
                </View>

                {/* Gestión */}
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

            <ConfirmationModal
                visible={showUnfollowModal}
                title="Quitar Expediente"
                description="¿Estás seguro que deseás dejar de seguir este expediente?"
                confirmText="Sí, quitar"
                cancelText="Mantener"
                type="danger"
                onConfirm={handleUnfollow}
                onCancel={() => setShowUnfollowModal(false)}
            />

            <Modal
                visible={showAgenda}
                animationType="slide"
                presentationStyle="fullScreen"
                statusBarTranslucent={false}
                onRequestClose={() => setShowAgenda(false)}
            >
                <AgendaWebView
                    iues={[item.iue]}
                    sede={item.sede}
                    onClose={() => setShowAgenda(false)}
                    onBookingComplete={(payload) => {
                        setShowAgenda(false);
                        if (payload.success) {
                            Toast.show({
                                type: 'success',
                                text1: '¡Turno agendado!',
                                text2: payload.confirmationCode
                                    ? `Código: ${payload.confirmationCode}`
                                    : 'Tu turno fue registrado exitosamente.',
                            });
                        }
                    }}
                />
            </Modal>
        </View>
    );
}
