import type { CustomerInfo } from "react-native-purchases";
import { parseISO, isValid, isAfter } from "date-fns";
import {
  ENTITLEMENT_PRO_ACCESS,
  PRODUCT_ID_MONTHLY,
} from "@/constants/revenuecat";


/**
 * Obtiene la fecha de expiración de la suscripción/trial desde CustomerInfo.
 * Devuelve null si no hay fecha de expiración o no es válida.
 */
export function getExpirationDateFromCustomerInfo(
  info: CustomerInfo,
): Date | null {
  const ent =
    info.entitlements.active[ENTITLEMENT_PRO_ACCESS] ??
    (info.entitlements.all[ENTITLEMENT_PRO_ACCESS]?.isActive
      ? info.entitlements.all[ENTITLEMENT_PRO_ACCESS]
      : null);
  let exp: string | Date | undefined =
    (ent as { expirationDate?: string })?.expirationDate;

  if (!exp) {
    const allExpDates =
      (info as { allExpirationDatesByProduct?: Record<string, string> })
        ?.allExpirationDatesByProduct ??
      (info as { allExpirationDates?: Record<string, string> })
        ?.allExpirationDates;
    exp = allExpDates?.[PRODUCT_ID_MONTHLY];
  }

  if (!exp) {
    const entFromAll = info.entitlements.all[ENTITLEMENT_PRO_ACCESS];
    exp = (entFromAll as { expirationDate?: string })?.expirationDate;
  }

  if (!exp) return null;
  const expDate = typeof exp === "string" ? parseISO(exp) : exp;
  return isValid(expDate) ? expDate : null;
}

export interface ProStatus {
  isPro: boolean;
  isInTrial: boolean;
}

export interface ProStatusDebug extends ProStatus {
  hasProFromEntitlement: boolean;
  hasProFromSubscriptions: boolean;
  hasProFromExpiration: boolean;
  hasProFromEntitlementExpiration: boolean;
  activeSubscriptions: string[];
  entitlementActive: boolean;
  entitlementAllIsActive: boolean;
  entitlementPeriodType: string | null;
  entitlementAllPeriodType: string | null;
}

/**
 * Parsea CustomerInfo de RevenueCat y determina si el usuario tiene Pro y si está en trial.
 * Usa fallbacks para sandbox donde entitlements.active a veces no se actualiza.
 *
 * Incluye fallback para suscripciones canceladas: si el usuario canceló pero tiene acceso
 * hasta una fecha futura (ej. hasta el 23), se considera Pro hasta esa fecha.
 */
export function parseProFromCustomerInfo(info: CustomerInfo): ProStatus {
  const debug = getProStatusDebug(info);
  return { isPro: debug.isPro, isInTrial: debug.isInTrial };
}

export function getProStatusDebug(info: CustomerInfo): ProStatusDebug {
  const ent =
    info.entitlements.active[ENTITLEMENT_PRO_ACCESS] ??
    (info.entitlements.all[ENTITLEMENT_PRO_ACCESS]?.isActive
      ? info.entitlements.all[ENTITLEMENT_PRO_ACCESS]
      : null);
  const hasProFromEntitlement = ent != null;
  const hasProFromSubscriptions =
    info.activeSubscriptions?.includes(PRODUCT_ID_MONTHLY) ?? false;

  // Fallback: suscripción cancelada pero con acceso hasta expiry (ej. hasta el 23)
  const infoExt = info as {
    allExpirationDatesByProduct?: Record<string, string>;
    allExpirationDates?: Record<string, string>;
  };
  const allExpDates =
    infoExt.allExpirationDatesByProduct ?? infoExt.allExpirationDates;
  const hasProFromExpiration =
    (() => {
      const exp = allExpDates?.[PRODUCT_ID_MONTHLY];
      if (!exp) return false;
      const expDate = typeof exp === "string" ? parseISO(exp) : exp;
      return isValid(expDate) && isAfter(expDate, new Date());
    })();

  const entFromAll = info.entitlements.all[ENTITLEMENT_PRO_ACCESS];
  const hasProFromEntitlementExpiration =
    entFromAll &&
    !entFromAll.isActive &&
    (() => {
      const exp = (entFromAll as { expirationDate?: string }).expirationDate;
      if (!exp) return false;
      const expDate = typeof exp === "string" ? parseISO(exp) : exp;
      return isValid(expDate) && isAfter(expDate, new Date());
    })();

  const isProUser =
    hasProFromEntitlement ||
    hasProFromSubscriptions ||
    hasProFromExpiration ||
    hasProFromEntitlementExpiration;

  // Trial: activo o cancelado con acceso hasta expiry (RevenueCat puede mover a all cuando cancela)
  const isInTrial =
    (ent?.periodType === "TRIAL" || ent?.periodType === "trial") ||
    (!!hasProFromEntitlementExpiration &&
      ((entFromAll as { periodType?: string })?.periodType === "TRIAL" ||
        (entFromAll as { periodType?: string })?.periodType === "trial"));
  return {
    isPro: isProUser,
    isInTrial,
    hasProFromEntitlement,
    hasProFromSubscriptions,
    hasProFromExpiration,
    hasProFromEntitlementExpiration,
    activeSubscriptions: info.activeSubscriptions ?? [],
    entitlementActive: !!ent,
    entitlementAllIsActive: !!entFromAll?.isActive,
    entitlementPeriodType: (ent as { periodType?: string })?.periodType ?? null,
    entitlementAllPeriodType:
      (entFromAll as { periodType?: string })?.periodType ?? null,
  };
}
