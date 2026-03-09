import React, { useMemo, useState, useCallback } from 'react';
import {
    LayoutAnimation,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    UIManager,
    View,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { CalendarClock, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react-native';
import { useDeadlineAgenda } from '@hooks/useDeadlineAgenda';
import { AgendaItemCard } from '@components/features';
import { PageContainer } from '@components/ui';
import type { IAgendaItem, AgendaSection } from '@app-types/deadline-agenda.types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Filter = 'all' | 'urgent' | 'open' | 'expired';

const FILTER_OPTIONS: Array<{ key: Filter; label: string }> = [
    { key: 'all',     label: 'Todos' },
    { key: 'urgent',  label: 'Urgentes' },
    { key: 'open',    label: 'Abiertos' },
    { key: 'expired', label: 'Vencidos' },
];

/** Sections that start expanded (most urgent) */
const DEFAULT_EXPANDED = new Set(['today', 'this_week']);

function applyFilter(items: IAgendaItem[], filter: Filter): IAgendaItem[] {
    switch (filter) {
        case 'urgent':  return items.filter((i) => i.status === 'OPEN' && i.daysRemaining <= 7);
        case 'open':    return items.filter((i) => i.status === 'OPEN');
        case 'expired': return items.filter((i) => i.status === 'EXPIRED');
        default:        return items;
    }
}

function buildSections(items: IAgendaItem[]): AgendaSection[] {
    const buckets: Record<string, IAgendaItem[]> = {
        today:      [],
        this_week:  [],
        this_month: [],
        later:      [],
        expired:    [],
        closed:     [],
    };

    for (const item of items) {
        if (item.status === 'CLOSED') {
            buckets.closed.push(item);
        } else if (item.status === 'EXPIRED') {
            buckets.expired.push(item);
        } else if (item.daysRemaining <= 0) {
            buckets.today.push(item);
        } else if (item.daysRemaining <= 7) {
            buckets.this_week.push(item);
        } else if (item.daysRemaining <= 30) {
            buckets.this_month.push(item);
        } else {
            buckets.later.push(item);
        }
    }

    return ([
        { key: 'today',      title: 'Vencen hoy',           emoji: '🚨', items: buckets.today },
        { key: 'this_week',  title: 'Esta semana',           emoji: '⚠️', items: buckets.this_week },
        { key: 'this_month', title: 'Este mes',              emoji: '📅', items: buckets.this_month },
        { key: 'later',      title: 'Más adelante',          emoji: '🗓️', items: buckets.later },
        { key: 'expired',    title: 'Vencidos',              emoji: '⌛', items: buckets.expired },
        { key: 'closed',     title: 'Cerrados / cumplidos',  emoji: '✅', items: buckets.closed },
    ] as AgendaSection[]).filter((s) => s.items.length > 0);
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function DeadlineAgendaScreen() {
    const { data, isLoading, isError, refetch, isRefetching } = useDeadlineAgenda();
    const [activeFilter, setActiveFilter] = useState<Filter>('all');

    const filtered = useMemo(() => applyFilter(data ?? [], activeFilter), [data, activeFilter]);
    const sections = useMemo(() => buildSections(filtered), [filtered]);

    // Expanded state per section key (urgent sections start expanded)
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set(DEFAULT_EXPANDED));

    const urgentCount = useMemo(
        () => (data ?? []).filter((i) => i.status === 'OPEN' && i.daysRemaining <= 7).length,
        [data],
    );

    const toggleSection = useCallback((key: string) => {
        LayoutAnimation.configureNext({
            duration: 280,
            create: { type: 'easeInEaseOut', property: 'opacity' },
            update: { type: 'easeInEaseOut' },
            delete: { type: 'easeInEaseOut', property: 'opacity' },
        });
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const header = (
        <View>
            <View className="px-4 pt-16 pb-4">
                <View className="flex-row items-center gap-3 mb-1">
                    <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-accent/10">
                        <CalendarClock size={20} color="#B89146" />
                    </View>
                    <View>
                        <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-slate-400">
                            LegalTech
                        </Text>
                        <Text className="text-xl font-sans-bold text-slate-900 dark:text-white">
                            Agenda Procesal
                        </Text>
                    </View>
                </View>
                <Text className="text-[13px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    Plazos detectados automáticamente en decretos de tus expedientes.
                </Text>
                {urgentCount > 0 && (
                    <View className="mt-4 flex-row items-center gap-3 rounded-[18px] border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/15 px-4 py-3">
                        <AlertTriangle size={15} color="#EF4444" />
                        <Text className="text-[13px] font-sans-semi text-red-600 dark:text-red-400 flex-1">
                            {urgentCount} plazo{urgentCount !== 1 ? 's' : ''} vence{urgentCount !== 1 ? 'n' : ''} en los próximos 7 días
                        </Text>
                    </View>
                )}
            </View>

            {/* Filter chips */}
            <View className="flex-row gap-2 px-4 pb-5 flex-wrap">
                {FILTER_OPTIONS.map(({ key, label }) => (
                    <Pressable
                        key={key}
                        onPress={() => setActiveFilter(key)}
                        className={`rounded-full border px-4 py-2 active:opacity-70 ${
                            activeFilter === key
                                ? 'border-accent bg-accent'
                                : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                        }`}
                    >
                        <Text className={`text-[12px] font-sans-semi ${activeFilter === key ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <PageContainer withHeader={false}>
                {header}
                <View className="items-center py-16">
                    <ActivityIndicator size="large" color="#B89146" />
                    <Text className="mt-3 text-[13px] font-sans text-slate-400">Cargando agenda...</Text>
                </View>
            </PageContainer>
        );
    }

    if (isError) {
        return (
            <PageContainer withHeader={false}>
                {header}
                <View className="items-center py-16 px-8">
                    <AlertTriangle size={36} color="#EF4444" />
                    <Text className="mt-3 text-sm font-sans-semi text-slate-500 text-center">No se pudo cargar la agenda</Text>
                    <Pressable className="mt-4 rounded-full bg-accent px-6 py-2.5 active:opacity-70" onPress={() => void refetch()}>
                        <Text className="text-[12px] font-sans-bold text-white">Reintentar</Text>
                    </Pressable>
                </View>
            </PageContainer>
        );
    }

    if (sections.length === 0) {
        return (
            <PageContainer withHeader={false}>
                {header}
                <View className="items-center py-16 px-8">
                    <CheckCircle size={40} color="#10B981" />
                    <Text className="mt-3 text-sm font-sans-semi text-slate-500">
                        {activeFilter === 'all' ? 'No hay plazos registrados' : 'No hay plazos en esta categoría'}
                    </Text>
                    {activeFilter === 'all' && (
                        <Text className="mt-1 text-[11px] font-sans text-slate-400 text-center">
                            Los plazos se detectan automáticamente al sincronizar expedientes con decretos.
                        </Text>
                    )}
                </View>
            </PageContainer>
        );
    }

    return (
        <PageContainer withHeader={false}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => void refetch()}
                        tintColor="#B89146"
                    />
                }
            >
                {header}
                <View className="pb-4">
                    {sections.map((section) => (
                        <CollapsibleSection
                            key={section.key}
                            section={section}
                            expanded={expandedKeys.has(section.key)}
                            onToggle={() => toggleSection(section.key)}
                        />
                    ))}
                </View>
            </ScrollView>
        </PageContainer>
    );
}

// ─── CollapsibleSection ─────────────────────────────────────────────────────

interface CollapsibleSectionProps {
    section: AgendaSection;
    expanded: boolean;
    onToggle: () => void;
}

function CollapsibleSection({ section, expanded, onToggle }: CollapsibleSectionProps) {
    const rotation = useSharedValue(expanded ? 1 : 0);

    // Sync rotation when expanded changes (e.g. when filter resets)
    React.useEffect(() => {
        rotation.value = withTiming(expanded ? 1 : 0, {
            duration: 250,
            easing: Easing.inOut(Easing.ease),
        });
    }, [expanded]);

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value * 180}deg` }],
    }));

    return (
        <View className="mb-1">
            {/* Section header — tappable */}
            <Pressable
                onPress={onToggle}
                className="flex-row items-center gap-2 mx-4 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/4 active:opacity-70 mb-2"
            >
                <Text className="text-[13px]">{section.emoji}</Text>
                <Text className="text-[12px] font-sans-bold text-slate-700 dark:text-slate-200 flex-1">
                    {section.title}
                </Text>
                <View className="rounded-full bg-slate-200 dark:bg-white/10 px-2 py-0.5 mr-2">
                    <Text className="text-[10px] font-sans-bold text-slate-500 dark:text-slate-400">
                        {section.items.length}
                    </Text>
                </View>
                <Animated.View style={chevronStyle}>
                    <ChevronDown size={15} color="#94A3B8" />
                </Animated.View>
            </Pressable>

            {/* Items — shown/hidden by LayoutAnimation */}
            {expanded && (
                <View className="px-4">
                    {section.items.map((item) => (
                        <AgendaItemCard key={item.id} item={item} />
                    ))}
                </View>
            )}
        </View>
    );
}
