import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import Purchases from 'react-native-purchases';
import { useSubscription } from '@context/SubscriptionContext';
import { parseProFromCustomerInfo } from '@utils/subscription';

const NAV_DELAY_MS = 300;

export function usePaywallActions() {
    const { applyCustomerInfo } = useSubscription();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleSubscribe = useCallback(async () => {
        setIsPurchasing(true);
        try {
            const offerings = await Purchases.getOfferings();
            const pkg =
                offerings.current?.monthly ??
                offerings.current?.availablePackages?.[0];
            if (!pkg) throw new Error('No hay paquetes disponibles');

            const { customerInfo: purchasedInfo } =
                await Purchases.purchasePackage(pkg);
            applyCustomerInfo(purchasedInfo, { forcePro: true });
            // No llamar refreshSubscription: en web/testing getCustomerInfo puede fallar
            // y sobrescribir el estado correcto. applyCustomerInfo ya tiene los datos de la compra.

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: '¡Bienvenido a Pro!',
                text2: 'Tu suscripción está activa.',
            });
            setTimeout(
                () => router.replace('/(tabs)' as import('expo-router').Href),
                NAV_DELAY_MS
            );
        } catch (err: unknown) {
            const e = err as { userCancelled?: boolean };
            if (!e?.userCancelled) {
                void Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                );
                Toast.show({
                    type: 'error',
                    text1: 'Error al suscribirse',
                    text2: 'Intentá de nuevo o contactá soporte.',
                });
            }
        } finally {
            setIsPurchasing(false);
        }
    }, [applyCustomerInfo]);

    const handleRestore = useCallback(async () => {
        setIsRestoring(true);
        try {
            const customerInfo = await Purchases.restorePurchases();
            const { isPro } = parseProFromCustomerInfo(customerInfo);
            applyCustomerInfo(customerInfo, { forcePro: isPro });
            if (isPro) {
                void Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );
                Toast.show({
                    type: 'success',
                    text1: 'Compras restauradas',
                    text2: 'Tu suscripción Pro está activa.',
                });
                setTimeout(
                    () =>
                        router.replace(
                            '/(tabs)' as import('expo-router').Href
                        ),
                    NAV_DELAY_MS
                );
            } else {
                Toast.show({
                    type: 'info',
                    text1: 'Sin compras previas',
                    text2: 'No se encontraron suscripciones para restaurar.',
                });
            }
        } catch (err) {
            void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            Toast.show({
                type: 'error',
                text1: 'Error al restaurar',
                text2: 'Intentá de nuevo más tarde.',
            });
        } finally {
            setIsRestoring(false);
        }
    }, [applyCustomerInfo]);

    return {
        handleSubscribe,
        handleRestore,
        isPurchasing,
        isRestoring,
    };
}
