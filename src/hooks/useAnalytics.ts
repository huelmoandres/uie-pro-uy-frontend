import { useCallback } from "react";
import { usePostHog } from "posthog-react-native";

/** Propiedades seguras para eventos de analytics (sin datos judiciales sensibles). */
export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Hook para tracking de analytics con PostHog.
 * Si el provider no está configurado, todos los métodos son no-ops silenciosos.
 *
 * Privacidad: nunca enviar IUEs, decretos, nombres de partes ni textos de
 * resoluciones judiciales en las propiedades de los eventos.
 */
export function useAnalytics() {
  const posthog = usePostHog();

  const trackEvent = useCallback(
    (event: string, properties?: AnalyticsProperties) => {
      posthog?.capture(event, properties as any);
    },
    [posthog],
  );

  const identifyUser = useCallback(
    (userId: string, properties?: AnalyticsProperties) => {
      posthog?.identify(userId, properties as any);
    },
    [posthog],
  );

  const resetUser = useCallback(() => {
    posthog?.reset();
  }, [posthog]);

  return { trackEvent, identifyUser, resetUser };
}
