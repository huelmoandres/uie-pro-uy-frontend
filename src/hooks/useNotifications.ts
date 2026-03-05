import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import { router } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

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
 * Hook for notification registration and management.
 * Refactored to avoid state-driven layout re-renders.
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

        // Listen for notifications received while the app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification: any) => {
                console.log('[Notifications] Received:', notification.request.identifier);
            },
        );

        // Handle tap on notification → deep link to expediente detail
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response: any) => {
                const data = response.notification.request.content.data as Record<string, unknown>;
                const expedienteId = data?.expedienteId as string | undefined;

                if (expedienteId) {
                    router.push(`/expedientes/${expedienteId}`);
                }
            },
        );

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    async function registerForPushNotifications() {
        if (!Device.isDevice || !Notifications) {
            return;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('expedientes', {
                name: 'Expedientes Judiciales',
                importance: (Notifications as any).AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#1E3A5F',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (projectId) {
            try {
                const token = await Notifications.getExpoPushTokenAsync({ projectId });
                console.log('[Notifications] Token acquired:', token.data);

                // Persist token in backend so the user receives push notifications
                await apiClient.post('/users/me/push-token', { token: token.data });
                console.log('[Notifications] Token saved to remote server.');
            } catch (error) {
                console.error('[Notifications] Failed to get push token:', error);
            }
        }
    }
}
