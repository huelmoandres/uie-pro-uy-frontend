import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FileText, Calendar, Clock, ChevronRight, Hash, Star } from 'lucide-react-native';
import type { IExpediente } from '@app-types/expediente.types';
import { formatRelativeDate, stripHtml } from '@utils/formatters';

interface Props {
    item: IExpediente;
    isSelected?: boolean;
    isSelectionMode?: boolean;
    onSelect?: (iue: string) => void;
    onPin?: (iue: string, isPinned: boolean) => void;
}

/**
 * Premium Expediente Card
 * Features depth, refined typography, and Lucide icons.
 */
export const ExpedienteCard = React.memo(({ item, isSelected, isSelectionMode, onSelect, onPin }: Props) => {
    const handlePress = useCallback(() => {
        if (isSelectionMode) {
            onSelect?.(item.iue);
        } else {
            router.push(`/expedientes/${item.iue.replace('/', ':')}`);
        }
    }, [isSelectionMode, item.iue, onSelect]);

    const handleLongPress = useCallback(() => {
        if (!isSelectionMode) {
            onSelect?.(item.iue);
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [isSelectionMode, item.iue, onSelect]);

    const handlePin = useCallback(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPin?.(item.iue, !item.isPinned);
    }, [item.iue, item.isPinned, onPin]);

    return (
        <Pressable
            className={`mb-3.5 overflow-hidden rounded-[24px] bg-white p-4 border shadow-premium dark:bg-slate-900/40 dark:shadow-premium-dark active:scale-[0.98] active:bg-slate-50 dark:active:bg-slate-900/60 ${isSelected
                ? 'border-accent bg-accent/5 dark:bg-accent/10'
                : 'border-slate-100 dark:border-white/5'
                }`}
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
        >
            {/* Header section */}
            <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-primary/30 border border-slate-200/50 dark:border-primary/20">
                    <Hash size={9} color="#64748B" className="mr-1" />
                    <Text className="text-[9.5px] font-sans-bold uppercase tracking-[0.5px] text-slate-600 dark:text-navy-200">
                        {item.iue}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    {isSelectionMode ? (
                        <View className={`h-5 w-5 rounded-full border items-center justify-center ${isSelected ? 'bg-accent border-accent' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                            {isSelected && <View className="h-2 w-2 rounded-full bg-white" />}
                        </View>
                    ) : (
                        <>
                            {onPin && (
                                <Pressable
                                    onPress={handlePin}
                                    hitSlop={8}
                                    className="p-0.5"
                                >
                                    <Star
                                        size={13}
                                        color={item.isPinned ? '#B89146' : '#CBD5E1'}
                                        fill={item.isPinned ? '#B89146' : 'transparent'}
                                    />
                                </Pressable>
                            )}
                            <Clock size={10} color="#94A3B8" className="mr-1" />
                            <Text className="text-[9.5px] font-sans-semi text-slate-400 uppercase tracking-tight">
                                {formatRelativeDate(item.lastSyncAt)}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {/* Main content */}
            <View className="flex-row">
                <View className="flex-1">
                    <Text className="mb-1.5 text-[15px] font-sans-bold leading-tight text-slate-900 dark:text-white" numberOfLines={2}>
                        {stripHtml(item.caratula) || 'Sin carátula registrada'}
                    </Text>

                    <View className="flex-row items-center">
                        <View className="h-1.5 w-1.5 rounded-full bg-accent mr-1.5" />
                        <Text className="flex-1 text-[12px] font-sans-medium text-slate-500 dark:text-slate-400" numberOfLines={1}>
                            {item.sede}
                        </Text>
                    </View>
                </View>
                <View className="ml-3 items-center justify-center">
                    <ChevronRight size={18} color="#CBD5E1" />
                </View>
            </View>

            {/* Separator */}
            <View className="my-3 h-[1px] w-full bg-slate-100 dark:bg-white/5" />

            {/* Footer stats */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <FileText size={12} color="#B89146" />
                    </View>
                    <Text className="text-[11px] font-sans-semi text-slate-600 dark:text-slate-400">
                        {item.totalMovimientos} <Text className="text-slate-400 font-sans">eventos</Text>
                    </Text>
                </View>

                <View className="flex-row items-center rounded-lg bg-slate-50 px-2.5 py-1 dark:bg-slate-800/30">
                    <Calendar size={11} color="#94A3B8" className="mr-1.5" />
                    <Text className="text-[10px] font-sans-bold text-slate-500 dark:text-slate-400">{item.anio}</Text>
                </View>
            </View>
        </Pressable>
    );
});
