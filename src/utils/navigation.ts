import { router, type Href } from "expo-router";
import { queryClient } from "@providers/QueryProvider";
import { ExpedienteService } from "@services";

/**
 * Convierte una IUE ("40-91/2018") al formato seguro para Expo Router ("40-91:2018").
 * Expo Router codifica "/" en params, por eso usamos ":" como separador en la URL.
 */
export function iueToRouteParam(iue: string): string {
  return iue.replace("/", ":");
}

/** Navega al detalle de un expediente a partir de su IUE. */
export function navigateToExpediente(iue: string): void {
  router.push(`/expedientes/${iueToRouteParam(iue)}` as Href);
}

/**
 * Navega al expediente desde una notificación push.
 * Primero vuelve a tabs para evitar acumular expedientes en el stack
 * (evita el "bucle" de tener que ir atrás por cada notificación).
 *
 * Cancela queries de listas de expedientes en vuelo: al hacer dismissTo("(tabs)")
 * la pestaña Expedientes monta y disparaba GET /expedientes (p. ej. con búsqueda
 * guardada) en paralelo al detalle, sumando carga y 429 con el throttler del API.
 */
export function navigateToExpedienteFromNotification(iue: string): void {
  const href = `/expedientes/${iueToRouteParam(iue)}` as Href;
  if (typeof router.dismissTo === "function") {
    void queryClient.cancelQueries({
      queryKey: [...ExpedienteService.queryKeys.lists()],
    });
    void queryClient.cancelQueries({
      queryKey: [...ExpedienteService.queryKeys.todayMovementsLists()],
    });
    router.dismissTo("/(tabs)");
    setTimeout(() => router.push(href), 50);
  } else {
    router.replace(href);
  }
}
