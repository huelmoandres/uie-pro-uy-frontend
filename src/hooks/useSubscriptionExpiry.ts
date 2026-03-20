import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import { useSubscription } from "@context/SubscriptionContext";

/** Umbral de días para mostrar aviso de vencimiento próximo */
const EXPIRING_SOON_DAYS = 7;

export interface SubscriptionExpiryInfo {
  /** Fecha de expiración del acceso Pro (null si no hay fecha conocida) */
  expirationDate: Date | null;
  /** Días restantes hasta la expiración (0 si hoy, negativo si ya venció) */
  daysRemaining: number | null;
  /** true si el acceso Pro vence en ≤ EXPIRING_SOON_DAYS días */
  isExpiringSoon: boolean;
  /** true si el usuario está en período de prueba */
  isInTrial: boolean;
}

/**
 * Hook que expone información de vencimiento del acceso Pro para cualquier tipo:
 * trial, suscripción activa, días promocionales por referido.
 * Usa proExpiresAt del SubscriptionContext (RC primero, backend como fallback).
 */
export function useSubscriptionExpiry(): SubscriptionExpiryInfo {
  const { isPro, isInTrial, proExpiresAt } = useSubscription();

  return useMemo(() => {
    if (!isPro || !proExpiresAt) {
      return {
        expirationDate: null,
        daysRemaining: null,
        isExpiringSoon: false,
        isInTrial,
      };
    }

    const daysRemaining = differenceInCalendarDays(proExpiresAt, new Date());
    const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= EXPIRING_SOON_DAYS;

    return {
      expirationDate: proExpiresAt,
      daysRemaining,
      isExpiringSoon,
      isInTrial,
    };
  }, [isPro, isInTrial, proExpiresAt]);
}
