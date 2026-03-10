import { router } from 'expo-router';

/**
 * Convierte una IUE ("40-91/2018") al formato seguro para Expo Router ("40-91:2018").
 * Expo Router codifica "/" en params, por eso usamos ":" como separador en la URL.
 */
export function iueToRouteParam(iue: string): string {
    return iue.replace('/', ':');
}

/** Navega al detalle de un expediente a partir de su IUE. */
export function navigateToExpediente(iue: string): void {
    router.push(`/expedientes/${iueToRouteParam(iue)}` as any);
}

/**
 * Navega al expediente desde una notificación push.
 * Primero vuelve a tabs para evitar acumular expedientes en el stack
 * (evita el "bucle" de tener que ir atrás por cada notificación).
 */
export function navigateToExpedienteFromNotification(iue: string): void {
    const href = `/expedientes/${iueToRouteParam(iue)}` as any;
    if (typeof router.dismissTo === 'function') {
        router.dismissTo('/(tabs)');
        setTimeout(() => router.push(href), 50);
    } else {
        router.replace(href);
    }
}
