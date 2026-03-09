import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import { router } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';
import { navigateToExpediente } from '@utils/navigation';

// Detect if we are running in Expo Go (where notifications are restricted in SDK 53+)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Lazy-load expo-notifications only if NOT in Expo Go to prevent crashes during module evaluation.
 */
const getNotificationsModule = () => {
    if (isExpoGo) return null;
    try {
        return require('expo-notifications');
    } catch (e) {
        console.error('[Notifications] Failed to load module:', e);
        return null;
    }
};

const Notifications = getNotificationsModule();

// Configure how notifications appear when the app is in foreground
if (Notifications) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
}

/**
 * Requests push notification permissions and registers the device token.
 * Called from NotificationPermissionModal after the user taps "Activar".
 */
export async function requestAndRegisterNotifications(): Promise<void> {
    if (isExpoGo || !Notifications || !Device.isDevice) return;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('expedientes', {
            name: 'Expedientes Judiciales',
            importance: (Notifications as any).AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1E3A5F',
        });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;
    try {
        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        await apiClient.post('/users/me/push-token', { token: token.data });
    } catch (error) {
        console.error('[Notifications] Failed to register token:', error);
    }
}

/**
 * Hook for notification registration, foreground display, and tap navigation.
 * Handles both foreground taps and cold-start taps (app was closed).
 */
export function useNotifications() {
    const notificationListener = useRef<NotificationsType.EventSubscription | null>(null);
    const responseListener = useRef<NotificationsType.EventSubscription | null>(null);

    useEffect(() => {
        if (isExpoGo || !Notifications) {
            console.warn('[Notifications] Remote notifications are not supported in Expo Go. Use a development build.');
            return;
        }

        // Run registration side-effect
        void registerForPushNotifications();

        // ── Foreground notification received ──────────────────────────
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification: any) => {
                console.log('[Notifications] Received:', notification.request.identifier);
            },
        );

        // ── User tapped a notification (app was open or backgrounded) ─
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response: any) => {
                handleNotificationResponse(response);
            },
        );

        // ── Cold start: app was fully closed when notification was tapped ─
        void Notifications.getLastNotificationResponseAsync().then((response: any) => {
            if (response) {
                // Small delay to ensure the navigator is ready
                setTimeout(() => handleNotificationResponse(response), 300);
            }
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    async function registerForPushNotifications() {
        if (!Device.isDevice || !Notifications) return;
        const { status } = await Notifications.getPermissionsAsync();
        // Only silently register if already granted (pre-prompt handled by NotificationPermissionModal)
        if (status === 'granted') {
            await requestAndRegisterNotifications();
        }
    }
}

function handleNotificationResponse(response: any) {
    const data = response?.notification?.request?.content?.data as Record<string, unknown> | undefined;
    if (!data) return;

    const type = data.type as string | undefined;
    const iue = data.expedienteId as string | undefined;

    // Type takes priority — DEADLINE_ALERT also carries expedienteId but should go to agenda.
    if (type === 'DEADLINE_ALERT') {
        router.push('/(tabs)/deadline-agenda' as any);
        return;
    }

    if (type === 'EXPEDIENTE_UPDATE' && iue) {
        navigateToExpediente(iue);
        return;
    }

    // Fallback: if there's an IUE for any other type, go to the expediente.
    if (iue) {
        navigateToExpediente(iue);
    }
}
