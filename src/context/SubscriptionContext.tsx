import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { getProStatusDebug, parseProFromCustomerInfo, getExpirationDateFromCustomerInfo } from "@utils/subscription";
import { isSimulateCancelledTrialEnabled } from "@utils/debugSubscription";
import {
  isBypassEmail,
  isEmailOnBypassList,
  isSubscriptionBypassDisabled,
  buildRevenueCatAttributes,
  getRevenueCatApiKey,
  resetToNoAccess,
  setBypassAccess,
} from "@utils/subscription-context-helpers";

const REVOKE_DELAY_MS = 2500;

interface SubscriptionContextData {
  isPro: boolean;
  isLoading: boolean;
  /** true si está en trial gratuito */
  isInTrial: boolean;
  /**
   * Fecha de expiración del acceso Pro.
   * Fuente: RC SDK (CustomerInfo) con fallback al campo proExpiresAt del backend.
   * null si no hay fecha conocida (bypass, perpetuo, o sin acceso).
   */
  proExpiresAt: Date | null;
  customerInfo: CustomerInfo | null;
  refreshSubscription: () => Promise<void>;
  /** Actualiza el estado con customerInfo. forcePro=true tras compra exitosa (sandbox puede no devolver entitlement). */
  applyCustomerInfo: (
    info: CustomerInfo,
    options?: { forcePro?: boolean },
  ) => void;
}

const SubscriptionContext = createContext<SubscriptionContextData | null>(null);

export function SubscriptionProvider({
  children,
  userId,
  userEmail,
  userName,
  isAuthLoading = false,
  backendIsPro = false,
  backendProExpiresAt = null,
}: {
  children: React.ReactNode;
  userId: string | null;
  userEmail?: string | null;
  userName?: string | null;
  /** true mientras Auth restaura sesión; evita flash a paywall antes de tener user. */
  isAuthLoading?: boolean;
  /** isPro que retorna el backend (/auth/me). Usado como fallback cuando RC aún no propagó el entitlement. */
  backendIsPro?: boolean;
  /** Fecha de expiración del Pro según backend. Evita falsos positivos post-expiración. */
  backendProExpiresAt?: string | null;
}) {
  const [isPro, setIsPro] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proExpiresAt, setProExpiresAt] = useState<Date | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const revokeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConfiguredUserIdRef = useRef<string | null>(null);

  const applyCustomerInfo = useCallback(
    (info: CustomerInfo, options?: { forcePro?: boolean }) => {
      setCustomerInfo(info);
      const { isPro: pro, isInTrial: trial } = parseProFromCustomerInfo(info);
      const hasAccess = options?.forcePro ?? (pro || trial);

      if (__DEV__) {
        const dbg = getProStatusDebug(info);
        console.log("[SubscriptionDebug] applyCustomerInfo", {
          userId,
          pro,
          trial,
          hasAccess,
          forcePro: options?.forcePro ?? null,
          ...dbg,
        });
      }

      if (hasAccess) {
        if (revokeTimeoutRef.current) {
          clearTimeout(revokeTimeoutRef.current);
          revokeTimeoutRef.current = null;
        }
        setIsPro(options?.forcePro ?? pro);
        setIsInTrial(trial);
        setProExpiresAt(getExpirationDateFromCustomerInfo(info));
      } else {
        if (revokeTimeoutRef.current) clearTimeout(revokeTimeoutRef.current);
        revokeTimeoutRef.current = setTimeout(() => {
          revokeTimeoutRef.current = null;
          setIsPro(false);
          setIsInTrial(false);
          setProExpiresAt(null);
        }, REVOKE_DELAY_MS);
      }
    },
    [userId],
  );

  const refreshSubscription = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      if (__DEV__) {
        console.log("[SubscriptionDebug] getCustomerInfo ok", {
          userId,
          entitlementKeys: Object.keys(info.entitlements.all ?? {}),
          activeSubscriptions: info.activeSubscriptions ?? [],
        });
      }
      applyCustomerInfo(info);
    } catch (err) {
      console.warn("RevenueCat getCustomerInfo failed:", err);
      setIsPro(false);
      setIsInTrial(false);
    } finally {
      setIsLoading(false);
    }
  }, [applyCustomerInfo, userId]);

  useEffect(() => {
    const apiKey = getRevenueCatApiKey();
    if (__DEV__) {
      console.log("[SubscriptionDebug] effect init", {
        userId,
        userEmail: userEmail ?? null,
        apiKeyConfigured: Boolean(apiKey),
        isAuthLoading,
      });
    }
    if (!apiKey) {
      __DEV__ &&
        console.warn(
          "RevenueCat API key not configured. Subscription checks disabled.",
        );
      resetToNoAccess(
        setIsLoading,
        setIsPro,
        setIsInTrial,
        setCustomerInfo,
        false,
      );
      return;
    }

    if (!userId) {
      lastConfiguredUserIdRef.current = null;
      if (isAuthLoading) {
        setIsLoading(true);
        return;
      }
      resetToNoAccess(
        setIsLoading,
        setIsPro,
        setIsInTrial,
        setCustomerInfo,
        true,
      );
      // Configurar anónimo si no está configurado, o desloguear si lo estaba
      Purchases.isConfigured().then((configured) => {
        if (!configured) {
          if (apiKey) Purchases.configure({ apiKey });
        } else {
          Purchases.logOut().catch(() => {});
        }
      });
      return;
    }

    setIsLoading(true);

    if (
      __DEV__ &&
      isEmailOnBypassList(userEmail) &&
      isSubscriptionBypassDisabled()
    ) {
      console.warn(
        "[SubscriptionDebug] email en SUBSCRIPTION_BYPASS_EMAILS pero bypass desactivado (EXPO_PUBLIC_DISABLE_SUBSCRIPTION_BYPASS) — usando RevenueCat",
        { userId, userEmail: userEmail ?? null },
      );
    }

    if (isBypassEmail(userEmail)) {
      if (__DEV__) {
        console.warn("[SubscriptionDebug] bypass email activo", {
          userId,
          userEmail: userEmail ?? null,
        });
      }
      setBypassAccess(setIsLoading, setIsPro, setIsInTrial);
      return;
    }

    let mounted = true;

    async function initRevenueCat() {
      if (__DEV__) {
        const debugSimulate = await isSimulateCancelledTrialEnabled();
        if (debugSimulate) {
          setBypassAccess(setIsLoading, setIsPro, setIsInTrial);
          __DEV__ && console.log("[Debug] Simulando trial cancelado con acceso");
          return;
        }
      }

      const alreadyConfigured = lastConfiguredUserIdRef.current === userId;

      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          await Purchases.configure({ apiKey, appUserID: userId as string });
          lastConfiguredUserIdRef.current = userId;
        } else if (!alreadyConfigured) {
          // LogOut antes de LogIn evita que RevenueCat transfiera compras del usuario
          // anterior al nuevo cuando se cambia de cuenta en el mismo dispositivo.
          await Purchases.logOut();
          await Purchases.logIn(userId as string);
          lastConfiguredUserIdRef.current = userId;
        }

        const attrs = buildRevenueCatAttributes(userEmail, userName);
        if (Object.keys(attrs).length > 0) {
          await Purchases.setAttributes(attrs);
        }

        if (mounted) await refreshSubscription();
      } catch (err) {
        if (!alreadyConfigured) lastConfiguredUserIdRef.current = null;
        console.warn("RevenueCat configure/logIn failed:", err);
        if (mounted) {
          resetToNoAccess(
            setIsLoading,
            setIsPro,
            setIsInTrial,
            setCustomerInfo,
            false,
          );
        }
      }
    }

    void initRevenueCat();
    return () => {
      mounted = false;
    };
  }, [userId, userEmail, userName, isAuthLoading, refreshSubscription]);

  useEffect(
    () => () => {
      if (revokeTimeoutRef.current) clearTimeout(revokeTimeoutRef.current);
    },
    [],
  );

  // Fallback: si el SDK de RC aún no propagó el entitlement (puede tardar segundos),
  // pero el backend ya confirma isPro=true con expiración futura, forzamos el acceso
  // y exponemos la fecha del backend para que la UI la pueda mostrar.
  useEffect(() => {
    if (isLoading || isPro || !backendIsPro) return;
    const backendExpiry = backendProExpiresAt ? new Date(backendProExpiresAt) : null;
    const isStillValid = !backendExpiry || backendExpiry > new Date();
    if (!isStillValid) return;

    if (__DEV__) {
      console.log(
        "[SubscriptionDebug] RC aún no propagó entitlement — usando isPro del backend como fallback",
        { userId, backendProExpiresAt },
      );
    }
    setIsPro(true);
    if (!proExpiresAt && backendExpiry) {
      setProExpiresAt(backendExpiry);
    }
  }, [isLoading, isPro, backendIsPro, backendProExpiresAt, userId, proExpiresAt]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        isLoading,
        isInTrial,
        proExpiresAt,
        customerInfo,
        refreshSubscription,
        applyCustomerInfo,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

const DEFAULT_SUBSCRIPTION: SubscriptionContextData = {
  isPro: false,
  isLoading: true,
  isInTrial: false,
  proExpiresAt: null,
  customerInfo: null,
  refreshSubscription: async () => {},
  applyCustomerInfo: () => {},
};

export function useSubscription(): SubscriptionContextData {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    return DEFAULT_SUBSCRIPTION;
  }
  return ctx;
}
