import React from 'react';
import { Text, View } from 'react-native';
import type { ActivityStatus } from '@app-types/expediente.types';

interface Props {
    status: ActivityStatus;
}

const STATUS_CONFIG: Record<ActivityStatus, { label: string; dot: string; text: string; bg: string }> = {
    ACTIVE:   { label: 'Activo',    dot: '#10B981', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ON_TRACK: { label: 'En curso',  dot: '#3B82F6', text: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    DELAYED:  { label: 'Demorado',  dot: '#F59E0B', text: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
    DORMANT:  { label: 'Inactivo',  dot: '#EF4444', text: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
    UNKNOWN:  { label: 'Sin datos', dot: '#94A3B8', text: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-700/30' },
};

export const ActivityStatusBadge = React.memo(({ status }: Props) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;

    return (
        <View className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${config.bg}`}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: config.dot }} />
            <Text className={`text-[11px] font-sans-bold ${config.text}`}>{config.label}</Text>
        </View>
    );
});
