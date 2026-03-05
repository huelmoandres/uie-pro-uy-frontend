import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { FileText, X } from 'lucide-react-native';
import type { IDecree } from '@app-types/expediente.types';
import { stripHtml } from '@utils/formatters';

interface Props {
    decree: IDecree;
}

/**
 * Pure component that shows a "Ver Decreto" button.
 * Tapping it opens the full text in a premium bottom-sheet Modal.
 * Rule 9: BlurView + slide animation.
 * Rule 11: pure, prop-driven.
 */
export const DecreeViewer = React.memo(({ decree }: Props) => {
    const [visible, setVisible] = useState(false);

    const decreeText = decree.isReserved
        ? 'Este decreto está reservado y no puede ser visualizado.'
        : (stripHtml(decree.textoDecreto ?? '') || 'Sin texto disponible.');

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
                    <View className="w-full max-h-[80%] rounded-t-[32px] bg-white dark:bg-[#0B1120] border border-b-0 border-slate-100 dark:border-white/5 overflow-hidden">
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
                            contentContainerStyle={{ paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {decree.isReserved && (
                                <View className="mb-4 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
                                    <Text className="text-[12px] font-sans-semi text-warning">
                                        ⚠️ Decreto reservado
                                    </Text>
                                </View>
                            )}
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

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
});
