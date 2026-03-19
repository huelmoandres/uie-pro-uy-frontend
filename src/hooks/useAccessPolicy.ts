import { useMemo } from "react";
import { useSubscription } from "@context/SubscriptionContext";
import { FREEMIUM_POLICY } from "@constants/freemium";

/**
 * Política de acceso freemium centralizada y reusable.
 * Evita lógica hardcodeada por pantalla para poder escalar reglas.
 */
export function useAccessPolicy() {
  const { isPro, isInTrial } = useSubscription();

  const hasPremiumAccess = isPro || isInTrial;
  const freeExpedientesLimit = FREEMIUM_POLICY.freeExpedientesLimit;

  return useMemo(
    () => ({
      hasPremiumAccess,
      freeExpedientesLimit,
      canAddExpediente: (followedCount: number): boolean =>
        hasPremiumAccess || followedCount < freeExpedientesLimit,
      getFreeQuotaUsage: (followedCount: number) => {
        const used = Math.min(followedCount, freeExpedientesLimit);
        const remaining = Math.max(freeExpedientesLimit - followedCount, 0);
        return {
          used,
          total: freeExpedientesLimit,
          remaining,
          isExhausted: remaining === 0,
          label: `${used} de ${freeExpedientesLimit} cupo gratuito`,
        };
      },
    }),
    [hasPremiumAccess, freeExpedientesLimit],
  );
}

