import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import { useSubscription } from "@context/SubscriptionContext";
import { getExpirationDateFromCustomerInfo } from "@utils/subscription";

/** Umbral de días para considerar que la prueba "está por vencer" */
const EXPIRING_SOON_DAYS = 7;

export interface SubscriptionExpiryInfo {
  /** Fecha de expiración (null si no aplica) */
  expirationDate: Date | null;
  /** Días restantes hasta la expiración (0 si hoy, negativo si ya venció) */
  daysRemaining: number | null;
  /** true si está en trial y faltan ≤ EXPIRING_SOON_DAYS días */
  isExpiringSoon: boolean;
  /** true si el usuario está en período de prueba */
  isInTrial: boolean;
}

/**
 * Hook que expone información de vencimiento de la suscripción/trial.
 * Útil para mostrar avisos como "Tu prueba está por vencer en X días".
 */
export function useSubscriptionExpiry(): SubscriptionExpiryInfo {
  const { customerInfo, isInTrial } = useSubscription();

  return useMemo(() => {
    if (!isInTrial || !customerInfo) {
      return {
        expirationDate: null,
        daysRemaining: null,
        isExpiringSoon: false,
        isInTrial: false,
      };
    }

    const expirationDate =
      getExpirationDateFromCustomerInfo(customerInfo);
    if (!expirationDate) {
      return {
        expirationDate: null,
        daysRemaining: null,
        isExpiringSoon: false,
        isInTrial: true,
      };
    }

    const daysRemaining = differenceInCalendarDays(
      expirationDate,
      new Date(),
    );
    const isExpiringSoon =
      daysRemaining >= 0 && daysRemaining <= EXPIRING_SOON_DAYS;

    return {
      expirationDate,
      daysRemaining,
      isExpiringSoon,
      isInTrial: true,
    };
  }, [customerInfo, isInTrial]);
}
