import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { AlertCircle, CheckCircle2, Clock, CreditCard, FileText, Sparkles, X } from 'lucide-react-native';
import type { IDecree, IDecreeSummary } from '@app-types/expediente.types';
import { stripHtml } from '@utils/formatters';
import { DeadlineBadge } from './DeadlineBadge';
import { useDecreeSummary } from '@hooks/useDecreeSummary';
import axios from 'axios';

interface Props {
    decree: IDecree;
}

/**
 * Pure component that shows a "Ver Decreto" button.
 * Tapping it opens the full text in a premium bottom-sheet Modal.
 * A "Resumir con IA" button generates an executive summary via OpenAI.
 */
export const DecreeViewer = React.memo(({ decree }: Props) => {
    const [visible, setVisible] = useState(false);
    const [summary, setSummary] = useState<IDecreeSummary | null>(null);

    const { mutate: summarize, isPending: isSummarizing, isError: summaryError, error: summaryRawError } = useDecreeSummary();

    const isQuotaError =
        axios.isAxiosError(summaryRawError) &&
        summaryRawError.response?.status === 402;

    const decreeText = decree.isReserved
        ? 'Este decreto está reservado y no puede ser visualizado.'
        : (stripHtml(decree.textoDecreto ?? '') || 'Sin texto disponible.');

    const canSummarize = !decree.isReserved && !!decree.textoDecreto?.trim();

    function handleSummarize() {
        summarize(decree.id, {
            onSuccess: (data) => setSummary(data),
        });
    }

    return (
        <>
            {/* Trigger button */}
            <Pressable
                className="mt-3 flex-row items-center gap-2 self-start rounded-xl border border-accent/25 bg-accent/8 px-3 py-2 active:opacity-70"
                onPress={() => setVisible(true)}
            >
                <FileText size={13} color="#B89146" />
                <Text className="text-[11px] font-sans-bold uppercase tracking-[1px] text-accent">
                    {decree.nroDecreto ? `Decreto ${decree.nroDecreto}` : 'Ver Decreto'}
                </Text>
            </Pressable>

            {/* Full-text Modal */}
            <Modal
                transparent
                visible={visible}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)}>
                        <View style={styles.backdrop} />
                    </Pressable>

                    {/* Sheet */}
                    <View className="w-full max-h-[88%] rounded-t-[32px] bg-white dark:bg-[#0B1120] border border-b-0 border-slate-100 dark:border-white/5 overflow-hidden">
                        {/* Handle */}
                        <View className="items-center pt-4 pb-2">
                            <View className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                        </View>

                        {/* Header */}
                        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
                            <View className="flex-row items-center gap-3 flex-1 mr-3">
                                <View className="h-9 w-9 items-center justify-center rounded-[14px] bg-accent/10">
                                    <FileText size={18} color="#B89146" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                        Decreto Judicial
                                    </Text>
                                    <Text className="text-sm font-sans-bold text-slate-900 dark:text-white" numberOfLines={1}>
                                        {decree.nroDecreto ?? 'Sin número'}
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setVisible(false)}
                                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 active:opacity-70"
                            >
                                <X size={15} color="#94A3B8" />
                            </Pressable>
                        </View>

                        {/* Scrollable content */}
                        <ScrollView
                            className="px-6 py-5"
                            contentContainerStyle={{ paddingBottom: 48 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {decree.isReserved && (
                                <View className="mb-4 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
                                    <Text className="text-[12px] font-sans-semi text-warning">
                                        ⚠️ Decreto reservado
                                    </Text>
                                </View>
                            )}

                            {decree.deadline?.hasDeadline && (
                                <View className="mb-4">
                                    <DeadlineBadge deadline={decree.deadline} />
                                </View>
                            )}

                            {/* ── AI Summary section ─────────────────────── */}
                            {canSummarize && (
                                <View className="mb-5">
                                    {!summary && !isSummarizing && !summaryError && (
                                        <Pressable
                                            onPress={handleSummarize}
                                            className="flex-row items-center gap-2 self-start rounded-xl border border-violet-400/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-2.5 active:opacity-70"
                                        >
                                            <Sparkles size={14} color="#7C3AED" />
                                            <Text className="text-[12px] font-sans-bold text-violet-700 dark:text-violet-400">
                                                Resumir con IA
                                            </Text>
                                        </Pressable>
                                    )}

                                    {isSummarizing && (
                                        <View className="flex-row items-center gap-3 rounded-xl border border-violet-400/20 bg-violet-50 dark:bg-violet-500/10 px-4 py-3">
                                            <ActivityIndicator size="small" color="#7C3AED" />
                                            <Text className="text-[12px] font-sans text-violet-700 dark:text-violet-400">
                                                Analizando decreto con IA...
                                            </Text>
                                        </View>
                                    )}

                                    {summaryError && !summary && (
                                        isQuotaError ? (
                                            <View className="flex-row items-start gap-2.5 rounded-xl border border-amber-300/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
                                                <CreditCard size={14} color="#D97706" style={{ marginTop: 1 }} />
                                                <Text className="flex-1 text-[12px] font-sans text-amber-700 dark:text-amber-400 leading-relaxed">
                                                    Sin créditos de IA. Recargá tu cuenta en{' '}
                                                    <Text className="font-sans-bold">platform.openai.com</Text>
                                                </Text>
                                            </View>
                                        ) : (
                                            <Pressable
                                                onPress={handleSummarize}
                                                className="flex-row items-center gap-2 self-start rounded-xl border border-red-300/30 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 active:opacity-70"
                                            >
                                                <AlertCircle size={14} color="#DC2626" />
                                                <Text className="text-[12px] font-sans-bold text-red-600 dark:text-red-400">
                                                    Error al resumir. Reintentar
                                                </Text>
                                            </Pressable>
                                        )
                                    )}

                                    {summary && <SummaryCard summary={summary} />}
                                </View>
                            )}

                            {/* Decree text */}
                            <Text className="text-[14px] font-sans leading-[22px] text-slate-700 dark:text-slate-300">
                                {decreeText}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
});

// ── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({ summary }: { summary: IDecreeSummary }) {
    return (
        <View className="rounded-2xl border border-violet-400/20 bg-violet-50 dark:bg-violet-500/8 overflow-hidden">
            {/* Card header */}
            <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
                <Sparkles size={13} color="#7C3AED" />
                <Text className="text-[10px] font-sans-bold uppercase tracking-[1.5px] text-violet-700 dark:text-violet-400">
                    Resumen IA
                </Text>
                {summary.fromCache && (
                    <Text className="ml-auto text-[10px] font-sans text-slate-400 dark:text-slate-500">
                        guardado
                    </Text>
                )}
            </View>

            {/* Summary text */}
            <View className="px-4 pb-3">
                <Text className="text-[13px] font-sans leading-[20px] text-slate-800 dark:text-slate-200">
                    {summary.summary}
                </Text>
            </View>

            {/* Highlights */}
            {summary.highlights.length > 0 && (
                <View className="px-4 pb-3 gap-1.5">
                    {summary.highlights.map((h, i) => (
                        <View key={i} className="flex-row items-start gap-2">
                            <View className="mt-[6px] h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                            <Text className="flex-1 text-[12px] font-sans leading-[18px] text-slate-700 dark:text-slate-300">
                                {h}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Action / Deadline badges */}
            <View className="flex-row flex-wrap gap-2 px-4 pb-4">
                {summary.requiresAction && (
                    <View className="flex-row items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/15 px-3 py-1.5">
                        <AlertCircle size={11} color="#D97706" />
                        <Text className="text-[11px] font-sans-bold text-amber-700 dark:text-amber-400">
                            {summary.actionDescription ?? 'Acción requerida'}
                        </Text>
                    </View>
                )}
                {summary.hasDeadline && !summary.requiresAction && (
                    <View className="flex-row items-center gap-1.5 rounded-lg bg-sky-100 dark:bg-sky-500/15 px-3 py-1.5">
                        <Clock size={11} color="#0284C7" />
                        <Text className="text-[11px] font-sans-bold text-sky-700 dark:text-sky-400">
                            Plazo detectado
                        </Text>
                    </View>
                )}
                {!summary.requiresAction && !summary.hasDeadline && (
                    <View className="flex-row items-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1.5">
                        <CheckCircle2 size={11} color="#059669" />
                        <Text className="text-[11px] font-sans-bold text-emerald-700 dark:text-emerald-400">
                            Sin acción requerida
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
});
