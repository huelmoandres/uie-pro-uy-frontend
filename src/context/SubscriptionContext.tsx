import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { Platform } from "react-native";
import { parseProFromCustomerInfo } from "@utils/subscription";
import { isSimulateCancelledTrialEnabled } from "@utils/debugSubscription";
import { SUBSCRIPTION_BYPASS_EMAILS } from "@/constants/revenuecat";

const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "";
const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "";

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
  isAuthLoading = false,
}: {
  children: React.ReactNode;
  userId: string | null;
  userEmail?: string | null;
  /** true mientras Auth restaura sesión; evita flash a paywall antes de tener user. */
  isAuthLoading?: boolean;
}) {
  const [isPro, setIsPro] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const revokeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        // Retrasar revocación para evitar flicker con trial cancelado (RevenueCat puede devolver datos inconsistentes)
        if (revokeTimeoutRef.current) clearTimeout(revokeTimeoutRef.current);
        revokeTimeoutRef.current = setTimeout(() => {
          revokeTimeoutRef.current = null;
          setIsPro(false);
          setIsInTrial(false);
        }, 2500);
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
    if (!userId) {
      // Si Auth sigue cargando, mantener isLoading para evitar flash a paywall
      if (isAuthLoading) {
        setIsLoading(true);
        return;
      }
      setIsLoading(false);
      setIsPro(false);
      setIsInTrial(false);
      setCustomerInfo(null);
      Purchases.logOut().catch(() => {});
      return;
    }

    setIsLoading(true);

    const emailLower = userEmail?.trim().toLowerCase();
    const isBypass =
      emailLower && SUBSCRIPTION_BYPASS_EMAILS.includes(emailLower);
    if (isBypass) {
      setIsLoading(false);
      setIsPro(true);
      setIsInTrial(false);
      return;
    }

    let mounted = true;

    async function runInit() {
      if (__DEV__) {
        const debugSimulate = await isSimulateCancelledTrialEnabled();
        if (debugSimulate) {
          setIsLoading(false);
          setIsPro(true);
          setIsInTrial(false);
          __DEV__ && console.log("[Debug] Simulando trial cancelado con acceso");
          return;
        }
      }

      const apiKey =
        Platform.OS === "ios"
          ? REVENUECAT_API_KEY_IOS
          : REVENUECAT_API_KEY_ANDROID;
      if (!apiKey) {
        __DEV__ &&
          console.warn(
            "RevenueCat API key not configured. Subscription checks disabled.",
          );
        setIsLoading(false);
        setIsPro(false);
        setIsInTrial(false);
        return;
      }

      try {
        await Purchases.configure({ apiKey });
        await Purchases.logIn(userId as string);
        if (mounted) {
          await refreshSubscription();
        }
      } catch (err) {
        console.warn("RevenueCat configure/logIn failed:", err);
        if (mounted) {
          setIsLoading(false);
          setIsPro(false);
          setIsInTrial(false);
        }
      }
    }

    void runInit();

    return () => {
      mounted = false;
    };
  }, [userId, userEmail, isAuthLoading, refreshSubscription]);

  useEffect(() => {
    return () => {
      if (revokeTimeoutRef.current) clearTimeout(revokeTimeoutRef.current);
    };
  }, []);

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
