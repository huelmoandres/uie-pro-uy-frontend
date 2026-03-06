import React from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, FileSearch, BellOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PageContainer } from '@components/ui';
import {
    useNotificationPreferences,
    useUpdateNotificationPreferences,
} from '@hooks/useNotificationPreferences';
import type { INotificationPreferences } from '@app-types/notification-preferences.types';

/** Tipos de notificación disponibles. Para agregar uno nuevo: añadir entrada aquí. */
const NOTIFICATION_TYPES: Array<{
    key: keyof Omit<INotificationPreferences, 'pushEnabled'>;
    icon: React.ComponentType<{ size: number; color: string }>;
    title: string;
    description: string;
}> = [
    {
        key: 'expedienteUpdates',
        icon: FileSearch,
        title: 'Movimientos judiciales',
        description:
            'Recibí una alerta cada vez que un expediente que seguís registre nuevos movimientos o decretos.',
    },
];

export default function NotificationsScreen() {
    const { data: prefs, isLoading } = useNotificationPreferences();
    const { mutate: updatePrefs } = useUpdateNotificationPreferences();

    const handleToggle = (key: keyof INotificationPreferences, value: boolean) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updatePrefs({ [key]: value });
    };

    const masterEnabled = prefs?.pushEnabled ?? true;

    return (
        <PageContainer>
            <Stack.Screen options={{ title: 'Notificaciones' }} />

            <View className="p-4 pt-6">

                {/* ── Banner informativo ─────────────────────────────── */}
                <View className="rounded-[24px] bg-primary p-5 mb-6 shadow-premium-dark relative overflow-hidden">
                    <View className="absolute -right-4 -top-4 opacity-10">
                        <Bell size={90} color="#FFFFFF" />
                    </View>
                    <Text className="text-base font-sans-bold text-white mb-1">
                        Alertas en tiempo real
                    </Text>
                    <Text className="text-[13px] font-sans text-slate-300 leading-relaxed">
                        Configurá qué notificaciones push querés recibir en tu dispositivo cuando haya novedades en tus expedientes.
                    </Text>
                </View>

                {/* ── Master toggle ──────────────────────────────────── */}
                <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                    General
                </Text>
                <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 mb-6">
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center flex-1 mr-4">
                            <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                                {masterEnabled
                                    ? <Bell size={18} color="#B89146" />
                                    : <BellOff size={18} color="#94A3B8" />
                                }
                            </View>
                            <View className="flex-1">
                                <Text className="font-sans-semi text-[15px] text-slate-800 dark:text-slate-200">
                                    Activar notificaciones
                                </Text>
                                <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
                                    Interruptor maestro de todas las alertas push
                                </Text>
                            </View>
                        </View>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#B89146" />
                        ) : (
                            <Switch
                                value={masterEnabled}
                                onValueChange={(v) => handleToggle('pushEnabled', v)}
                                trackColor={{ false: '#E2E8F0', true: '#B89146' }}
                                thumbColor="#FFFFFF"
                            />
                        )}
                    </View>
                </View>

                {/* ── Tipos de notificaciones ────────────────────────── */}
                <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                    Tipos de Alerta
                </Text>
                <View className={`overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 ${!masterEnabled ? 'opacity-40' : ''}`}>
                    {NOTIFICATION_TYPES.map((item, index) => {
                        const Icon = item.icon;
                        const isEnabled = prefs?.[item.key] ?? true;
                        const isLast = index === NOTIFICATION_TYPES.length - 1;

                        return (
                            <View
                                key={item.key}
                                className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-slate-50 dark:border-white/5' : ''}`}
                            >
                                <View className="flex-row items-center flex-1 mr-4">
                                    <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                                        <Icon
                                            size={17}
                                            color={isEnabled && masterEnabled ? '#64748B' : '#94A3B8'}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-sans-semi text-[14px] text-slate-700 dark:text-slate-300">
                                            {item.title}
                                        </Text>
                                        <Text className="text-[11px] font-sans text-slate-400 mt-0.5 leading-tight">
                                            {item.description}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={isEnabled}
                                    onValueChange={(v) => handleToggle(item.key, v)}
                                    disabled={!masterEnabled || isLoading}
                                    trackColor={{ false: '#E2E8F0', true: '#B89146' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        );
                    })}
                </View>

                {/* ── Nota informativa ──────────────────────────────── */}
                <Text className="mt-4 mx-2 text-[11px] font-sans text-slate-400 leading-relaxed text-center">
                    Las notificaciones push requieren que hayas otorgado permiso al sistema operativo. Si no las recibís, verificá la configuración de tu dispositivo.
                </Text>

            </View>
        </PageContainer>
    );
}
