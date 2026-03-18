import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { parseProFromCustomerInfo } from "@utils/subscription";
import { isSimulateCancelledTrialEnabled } from "@utils/debugSubscription";
import {
  isBypassEmail,
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
}: {
  children: React.ReactNode;
  userId: string | null;
  userEmail?: string | null;
  userName?: string | null;
  /** true mientras Auth restaura sesión; evita flash a paywall antes de tener user. */
  isAuthLoading?: boolean;
}) {
  const [isPro, setIsPro] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const revokeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConfiguredUserIdRef = useRef<string | null>(null);

  const applyCustomerInfo = useCallback(
    (info: CustomerInfo, options?: { forcePro?: boolean }) => {
      setCustomerInfo(info);
      const { isPro: pro, isInTrial: trial } = parseProFromCustomerInfo(info);
      const hasAccess = options?.forcePro ?? (pro || trial);

      if (hasAccess) {
        if (revokeTimeoutRef.current) {
          clearTimeout(revokeTimeoutRef.current);
          revokeTimeoutRef.current = null;
        }
        setIsPro(options?.forcePro ?? pro);
        setIsInTrial(trial);
      } else {
        if (revokeTimeoutRef.current) clearTimeout(revokeTimeoutRef.current);
        revokeTimeoutRef.current = setTimeout(() => {
          revokeTimeoutRef.current = null;
          setIsPro(false);
          setIsInTrial(false);
        }, REVOKE_DELAY_MS);
      }
    },
    [],
  );

  const refreshSubscription = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      applyCustomerInfo(info);
    } catch (err) {
      console.warn("RevenueCat getCustomerInfo failed:", err);
      setIsPro(false);
      setIsInTrial(false);
    } finally {
      setIsLoading(false);
    }
  }, [applyCustomerInfo]);

  useEffect(() => {
    const apiKey = getRevenueCatApiKey();
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

    if (isBypassEmail(userEmail)) {
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

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        isLoading,
        isInTrial,
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
