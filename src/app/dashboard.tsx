import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
    LayoutDashboard,
    AlertTriangle,
    Clock,
    TrendingDown,
    Zap,
    BarChart2,
    ChevronRight,
    RefreshCw,
} from 'lucide-react-native';
import { useDashboard } from '@hooks/useDashboard';
import { PageContainer } from '@components/ui';
import { CaseStageBadge } from '@components/features';
import { formatDate, stripHtml } from '@utils/formatters';
import type { IDeadlineSummary, IDormantExpediente, IRecentMovement, IStageDistribution } from '@app-types/dashboard.types';

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <View className="flex-1 rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
            <Text style={{ color }} className="text-2xl font-sans-bold">{value}</Text>
            <Text className="text-[10px] font-sans text-slate-400 mt-0.5 leading-tight">{label}</Text>
        </View>
    );
}

function SectionTitle({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ size: number; color: string }> }) {
    return (
        <View className="flex-row items-center gap-2 mb-3 mt-6">
            <Icon size={14} color="#94A3B8" />
            <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-slate-400">{label}</Text>
        </View>
    );
}

function DeadlineRow({ item }: { item: IDeadlineSummary }) {
    const isUrgent = item.daysRemaining <= 3;
    return (
        <View className={`rounded-[16px] border p-3 mb-2 ${isUrgent ? 'border-red-200 bg-red-50/60 dark:border-red-800/30 dark:bg-red-900/10' : 'border-amber-200 bg-amber-50/60 dark:border-amber-800/30 dark:bg-amber-900/10'}`}>
            <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                    <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-wide">{item.expedienteIue}</Text>
                    <Text className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300 mt-0.5" numberOfLines={1}>
                        {stripHtml(item.expedienteCaratula) || 'Sin carátula'}
                    </Text>
                    <Text className="text-[10px] font-sans text-slate-400 mt-0.5" numberOfLines={1}>
                        {item.detectedText}
                    </Text>
                </View>
                <View className={`rounded-full px-2 py-1 ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    <Text className={`text-[11px] font-sans-bold ${isUrgent ? 'text-red-500' : 'text-amber-600'}`}>
                        {item.daysRemaining <= 0 ? 'Hoy' : `${item.daysRemaining}d`}
                    </Text>
                </View>
            </View>
        </View>
    );
}

function DormantRow({ item }: { item: IDormantExpediente }) {
    return (
        <Pressable
            className="flex-row items-center justify-between rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3 mb-2 active:opacity-70"
            onPress={() => router.push(`/expedientes/${item.iue.replace('/', ':')}` as any)}
        >
            <View className="flex-1 mr-3">
                <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-wide">{item.iue}</Text>
                <Text className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300 mt-0.5" numberOfLines={1}>
                    {stripHtml(item.caratula) || 'Sin carátula'}
                </Text>
            </View>
            <View className="items-end gap-0.5">
                <Text className="text-[10px] font-sans-bold text-red-400">{item.daysSinceLastActivity}d sin actividad</Text>
                <Text className="text-[10px] font-sans text-slate-400">{formatDate(item.lastActivityDate)}</Text>
            </View>
        </Pressable>
    );
}

function RecentMovementRow({ item }: { item: IRecentMovement }) {
    const color = item.priority === 'HIGH' ? '#B89146' : item.priority === 'MEDIUM' ? '#3B82F6' : '#94A3B8';
    return (
        <Pressable
            className="flex-row items-start gap-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3 mb-2 active:opacity-70"
            onPress={() => router.push(`/expedientes/${item.expedienteIue.replace('/', ':')}` as any)}
        >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 5 }} />
            <View className="flex-1">
                <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-wide">{item.expedienteIue}</Text>
                <Text className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300" numberOfLines={1}>
                    {item.tipo}
                </Text>
                <Text className="text-[10px] font-sans text-slate-400 mt-0.5">{formatDate(item.fecha)}</Text>
            </View>
            <ChevronRight size={14} color="#CBD5E1" />
        </Pressable>
    );
}

function StageBar({ item, total }: { item: IStageDistribution; total: number }) {
    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
    return (
        <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1">
                <CaseStageBadge stage={item.stage} />
                <Text className="text-[11px] font-sans-semi text-slate-400">{item.count} ({pct}%)</Text>
            </View>
            <View className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <View style={{ width: `${pct}%` }} className="h-1.5 rounded-full bg-accent" />
            </View>
        </View>
    );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
    const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

    const stageTotal = data?.stageDistribution.reduce((acc, s) => acc + s.count, 0) ?? 0;

    return (
        <PageContainer withHeader={false}>
            <Stack.Screen options={{ title: 'Dashboard' }} />

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
                {/* ── Header ──────────────────────────────────────────── */}
                <View className="px-4 pt-6 pb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-accent/10">
                            <LayoutDashboard size={20} color="#B89146" />
                        </View>
                        <View>
                            <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-slate-400">Estudio Jurídico</Text>
                            <Text className="text-xl font-sans-bold text-slate-900 dark:text-white">Dashboard</Text>
                        </View>
                    </View>
                    <Pressable
                        className="h-9 w-9 items-center justify-center rounded-[12px] bg-slate-50 dark:bg-white/5 active:opacity-70"
                        onPress={() => void refetch()}
                    >
                        <RefreshCw size={15} color={isRefetching ? '#B89146' : '#64748B'} />
                    </Pressable>
                </View>

                {isLoading && (
                    <View className="items-center py-20">
                        <ActivityIndicator size="large" color="#B89146" />
                        <Text className="mt-3 text-[13px] font-sans text-slate-400">Cargando dashboard...</Text>
                    </View>
                )}

                {isError && (
                    <View className="items-center py-20 px-8">
                        <AlertTriangle size={36} color="#EF4444" />
                        <Text className="mt-3 text-sm font-sans-semi text-slate-500 text-center">
                            No se pudo cargar el dashboard
                        </Text>
                        <Pressable
                            className="mt-4 rounded-full bg-accent px-6 py-2.5 active:opacity-70"
                            onPress={() => void refetch()}
                        >
                            <Text className="text-[12px] font-sans-bold text-white">Reintentar</Text>
                        </Pressable>
                    </View>
                )}

                {data && (
                    <View className="px-4">
                        {/* ── Stats row ────────────────────────────────── */}
                        <View className="flex-row gap-3 mb-2">
                            <StatCard value={data.stats.totalFollowed}     label="Expedientes seguidos" color="#B89146" />
                            <StatCard value={data.stats.activeInLast30Days} label="Activos (30d)"         color="#10B981" />
                        </View>
                        <View className="flex-row gap-3">
                            <StatCard value={data.stats.openDeadlines}      label="Plazos abiertos"       color="#3B82F6" />
                            <StatCard value={data.stats.urgentDeadlineCount} label="Urgentes (≤7d)"        color="#EF4444" />
                        </View>

                        {/* ── Urgent deadlines ─────────────────────────── */}
                        {data.urgentDeadlines.length > 0 && (
                            <>
                                <SectionTitle label="Plazos urgentes" icon={AlertTriangle} />
                                {data.urgentDeadlines.map((d) => (
                                    <DeadlineRow key={d.id} item={d} />
                                ))}
                            </>
                        )}

                        {/* ── Warning deadlines ────────────────────────── */}
                        {data.warningDeadlines.length > 0 && (
                            <>
                                <SectionTitle label="Plazos próximos" icon={Clock} />
                                {data.warningDeadlines.map((d) => (
                                    <DeadlineRow key={d.id} item={d} />
                                ))}
                            </>
                        )}

                        {/* ── Recent high-priority movements ───────────── */}
                        {data.recentHighPriorityMovements.length > 0 && (
                            <>
                                <SectionTitle label="Movimientos recientes" icon={Zap} />
                                {data.recentHighPriorityMovements.map((m, i) => (
                                    <RecentMovementRow key={i} item={m} />
                                ))}
                            </>
                        )}

                        {/* ── Dormant expedientes ──────────────────────── */}
                        {data.dormantExpedientes.length > 0 && (
                            <>
                                <SectionTitle label="Expedientes inactivos" icon={TrendingDown} />
                                {data.dormantExpedientes.map((d) => (
                                    <DormantRow key={d.iue} item={d} />
                                ))}
                            </>
                        )}

                        {/* ── Stage distribution ───────────────────────── */}
                        {data.stageDistribution.length > 0 && (
                            <>
                                <SectionTitle label="Distribución por etapa" icon={BarChart2} />
                                <View className="rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
                                    {data.stageDistribution.map((s) => (
                                        <StageBar key={s.stage} item={s} total={stageTotal} />
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </PageContainer>
    );
}
