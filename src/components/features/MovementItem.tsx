import React from 'react';
import { Text, View } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import type { IMovement } from '@app-types/expediente.types';
import { formatDate, getMovementTypeLabel } from '@utils/formatters';
import { DecreeViewer } from './DecreeViewer';

interface Props {
    item: IMovement;
    isFirst: boolean;
    isLast: boolean;
}

/**
 * Pure component that renders a single judicial movement in a vertical timeline.
 * If the movement has a decree, it embeds a DecreeViewer below.
 * Per ai-rules.md Rule 11: pure, prop-driven, no internal fetching.
 */
export const MovementItem = React.memo(({ item, isFirst, isLast }: Props) => {
    return (
        <View className="flex-row">
            {/* Timeline spine */}
            <View className="items-center" style={{ width: 28 }}>
                {/* Top connector line */}
                <View
                    className={`w-[2px] flex-1 ${isFirst ? 'bg-transparent' : 'bg-slate-100 dark:bg-white/5'}`}
                    style={{ maxHeight: 12 }}
                />
                {/* Dot */}
                <View className={`h-3 w-3 rounded-full border-2 border-white dark:border-primary ${item.decree ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-600'}`} />
                {/* Bottom connector line */}
                <View
                    className={`w-[2px] flex-1 ${isLast ? 'bg-transparent' : 'bg-slate-100 dark:bg-white/5'}`}
                />
            </View>

            {/* Content card */}
            <View className={`flex-1 ml-3 ${isLast ? 'pb-2' : 'pb-5'}`}>
                {/* Type + Date row */}
                <View className="flex-row items-start justify-between gap-2">
                    <Text
                        className={`flex-1 text-[13px] font-sans-semi leading-tight ${item.decree ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                        numberOfLines={2}
                    >
                        {getMovementTypeLabel(item.tipo)}
                    </Text>
                    <View className="flex-row items-center gap-1 flex-shrink-0">
                        <Clock size={10} color="#94A3B8" />
                        <Text className="text-[10px] font-sans text-slate-400">
                            {formatDate(item.fecha)}
                        </Text>
                    </View>
                </View>

                {/* Sede */}
                <View className="mt-1 flex-row items-center gap-1">
                    <MapPin size={10} color="#94A3B8" />
                    <Text className="text-[11px] font-sans text-slate-400 dark:text-slate-500 flex-1" numberOfLines={1}>
                        {item.sede}
                    </Text>
                </View>

                {/* Decree viewer (only when present) */}
                {item.decree && <DecreeViewer decree={item.decree} />}
            </View>
        </View>
    );
});
