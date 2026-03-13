import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { Platform } from "react-native";
import { parseProFromCustomerInfo } from "@utils/subscription";
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

const SubscriptionContext = createContext<SubscriptionContextData>(
  {} as SubscriptionContextData,
);

export function SubscriptionProvider({
  children,
  userId,
  userEmail,
}: {
  children: React.ReactNode;
  userId: string | null;
  userEmail?: string | null;
}) {
  const [isPro, setIsPro] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const applyCustomerInfo = useCallback(
    (info: CustomerInfo, options?: { forcePro?: boolean }) => {
      setCustomerInfo(info);
      const { isPro: pro, isInTrial: trial } = parseProFromCustomerInfo(info);
      setIsPro(options?.forcePro ?? pro);
      setIsInTrial(trial);
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
      setIsLoading(false);
      setIsPro(false);
      setIsInTrial(false);
      setCustomerInfo(null);
      Purchases.logOut().catch(() => {});
      return;
    }

    const emailLower = userEmail?.trim().toLowerCase();
    const isBypass =
      emailLower && SUBSCRIPTION_BYPASS_EMAILS.includes(emailLower);
    if (isBypass) {
      setIsLoading(false);
      setIsPro(true);
      setIsInTrial(false);
      return;
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

    let mounted = true;

    async function init() {
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

    void init();
    return () => {
      mounted = false;
    };
  }, [userId, userEmail, refreshSubscription]);

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

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx || typeof ctx.isPro === "undefined") {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
