import React, { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    Text,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, CheckCircle2, RefreshCw, Shield } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/components/base/useColorScheme';

const STORAGE_KEY = 'notification_permission_prompted';

const BENEFITS = [
    { icon: RefreshCw,   text: 'Enterate cuando hay nuevos movimientos en tus expedientes' },
    { icon: Bell,        text: 'Alertas de plazos procesales antes de que venzan' },
    { icon: Shield,      text: 'Tu información es privada, nunca la compartimos' },
];

interface Props {
    onRequestPermission: () => Promise<void>;
}

export function NotificationPermissionModal({ onRequestPermission }: Props) {
    const [visible, setVisible] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        void checkShouldShow();
    }, []);

    async function checkShouldShow() {
        try {
            // Only request on real devices
            const Device = await import('expo-device');
            if (!Device.default.isDevice) return;

            // Check if we already prompted
            const prompted = await AsyncStorage.getItem(STORAGE_KEY);
            if (prompted) return;

            // Check current permission status
            const Notifications = require('expo-notifications');
            const { status } = await Notifications.getPermissionsAsync();
            if (status === 'granted') {
                await AsyncStorage.setItem(STORAGE_KEY, 'granted');
                return;
            }
            if (status === 'denied') {
                await AsyncStorage.setItem(STORAGE_KEY, 'denied');
                return;
            }

            // Status is 'undetermined' — show our pre-prompt
            // Small delay so the app finishes loading visually
            setTimeout(() => setVisible(true), 1200);
        } catch {
            // Silently ignore — notifications are optional
        }
    }

    async function handleAllow() {
        setVisible(false);
        await AsyncStorage.setItem(STORAGE_KEY, 'prompted');
        await onRequestPermission();
    }

    async function handleDismiss() {
        setVisible(false);
        await AsyncStorage.setItem(STORAGE_KEY, 'dismissed');
    }

    const bg = isDark ? '#0B1120' : '#FFFFFF';
    const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const border = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
    const benefitBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            statusBarTranslucent
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <BlurView
                    intensity={isDark ? 30 : 20}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
                    <View style={styles.backdrop} />
                </Pressable>

                <View style={[styles.sheet, { backgroundColor: bg, borderColor: border }]}>
                    {/* Handle */}
                    <View style={styles.handle}>
                        <View style={[styles.handleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }]} />
                    </View>

                    {/* Icon */}
                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(184,145,70,0.12)' }]}>
                        <Bell size={28} color="#B89146" strokeWidth={1.8} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: textPrimary }]}>
                        Activá las notificaciones
                    </Text>
                    <Text style={[styles.subtitle, { color: textSecondary }]}>
                        Recibí alertas en tiempo real sobre tus expedientes judiciales.
                    </Text>

                    {/* Benefits */}
                    <View style={styles.benefits}>
                        {BENEFITS.map(({ icon: Icon, text }, i) => (
                            <View key={i} style={[styles.benefit, { backgroundColor: benefitBg, borderColor: border }]}>
                                <View style={styles.benefitIcon}>
                                    <Icon size={15} color="#B89146" strokeWidth={2} />
                                </View>
                                <Text style={[styles.benefitText, { color: textSecondary }]}>
                                    {text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <Pressable
                        onPress={handleAllow}
                        style={({ pressed }) => [styles.btnPrimary, { opacity: pressed ? 0.85 : 1 }]}
                    >
                        <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.btnPrimaryText}>Activar notificaciones</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleDismiss}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.btnSecondary]}
                    >
                        <Text style={[styles.btnSecondaryText, { color: textSecondary }]}>
                            Ahora no
                        </Text>
                    </Pressable>

                    {Platform.OS === 'ios' && (
                        <Text style={[styles.disclaimer, { color: isDark ? '#475569' : '#CBD5E1' }]}>
                            Podés cambiar esto en cualquier momento desde Configuración.
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    sheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderBottomWidth: 0,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    handle: {
        paddingTop: 14,
        paddingBottom: 8,
        alignItems: 'center',
        width: '100%',
    },
    handleBar: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    benefits: {
        width: '100%',
        gap: 8,
        marginBottom: 24,
    },
    benefit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    benefitIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(184,145,70,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    benefitText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    btnPrimary: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#1E3A5F',
        borderRadius: 16,
        paddingVertical: 15,
        marginBottom: 12,
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    btnSecondary: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    btnSecondaryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
        paddingHorizontal: 16,
        lineHeight: 16,
    },
});
