import type { CustomerInfo } from "react-native-purchases";
import {
  ENTITLEMENT_PRO_ACCESS,
  PRODUCT_ID_MONTHLY,
} from "@/constants/revenuecat";

export interface ProStatus {
  isPro: boolean;
  isInTrial: boolean;
}

/**
 * Parsea CustomerInfo de RevenueCat y determina si el usuario tiene Pro y si está en trial.
 * Usa fallbacks para sandbox donde entitlements.active a veces no se actualiza.
 */
export function parseProFromCustomerInfo(info: CustomerInfo): ProStatus {
  const ent =
    info.entitlements.active[ENTITLEMENT_PRO_ACCESS] ??
    (info.entitlements.all[ENTITLEMENT_PRO_ACCESS]?.isActive
      ? info.entitlements.all[ENTITLEMENT_PRO_ACCESS]
      : null);
  const hasProFromEntitlement = ent != null;
  const hasProFromSubscriptions =
    info.activeSubscriptions?.includes(PRODUCT_ID_MONTHLY) ?? false;
  const isProUser = hasProFromEntitlement || hasProFromSubscriptions;
  const isInTrial =
    (ent?.periodType === "TRIAL" || ent?.periodType === "trial") ?? false;
  return { isPro: isProUser, isInTrial };
}
