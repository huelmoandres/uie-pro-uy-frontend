import type { CustomerInfo } from "react-native-purchases";
import { differenceInDays, isAfter, parseISO, isValid } from "date-fns";
import { ENTITLEMENT_PRO_ACCESS } from "@/constants/revenuecat";
import type { IUser } from "@app-types/auth.types";

export type ReferralOrigin = "user" | "partner" | null;
export type ProSource = "trial" | "promotional" | "paid" | null;

export interface ProAccessInfo {
  /** Tiene acceso Pro activo. */
  isActive: boolean;
  /** Días restantes de acceso (null si no tiene o es lifetime). */
  daysRemaining: number | null;
  /** Fecha de vencimiento (null si no tiene). */
  expirationDate: Date | null;
  /** Origen del acceso actual. */
  source: ProSource;
  /** Cómo obtuvo el acceso de referido (null si no fue referido). */
  referralOrigin: ReferralOrigin;
}

/**
 * Extrae la información de acceso Pro combinando CustomerInfo de RevenueCat
 * con el perfil del usuario (para saber si fue referido y cómo).
 */
export function getProAccessInfo(
  customerInfo: CustomerInfo | null,
  user: IUser | null,
  isPro: boolean,
  isInTrial: boolean,
): ProAccessInfo {
  const referralOrigin = getReferralOrigin(user);
  const expirationDate = customerInfo
    ? extractExpirationDate(customerInfo)
    : null;
  const daysRemaining =
    expirationDate && isAfter(expirationDate, new Date())
      ? Math.max(0, differenceInDays(expirationDate, new Date()))
      : null;

  const source = resolveProSource(customerInfo, isInTrial);

  return {
    isActive: isPro || isInTrial,
    daysRemaining,
    expirationDate,
    source,
    referralOrigin,
  };
}

/** Determina el origen del referido del usuario (null si no fue referido). */
export function getReferralOrigin(
  user: IUser | null | undefined,
): ReferralOrigin {
  if (!user) return null;
  if (user.referralType === "PARTNER") return "partner";
  if (user.referralType === "USER" || user.referredById) return "user";
  return null;
}

/** Etiqueta legible del origen del referido. */
export function getReferralOriginLabel(origin: ReferralOrigin): string {
  if (origin === "partner") return "código de partner";
  if (origin === "user") return "código de un colega";
  return "";
}

/** Días gratis según el origen del referido. */
export function getReferralRewardDays(origin: ReferralOrigin): number {
  if (origin === "partner") return 30;
  if (origin === "user") return 7;
  return 0;
}

function resolveProSource(
  customerInfo: CustomerInfo | null,
  isInTrial: boolean,
): ProSource {
  if (!customerInfo) return null;
  if (isInTrial) return "trial";

  const ent =
    customerInfo.entitlements.active[ENTITLEMENT_PRO_ACCESS] ??
    customerInfo.entitlements.all[ENTITLEMENT_PRO_ACCESS];

  const periodType = (
    ent as { periodType?: string } | undefined
  )?.periodType?.toUpperCase();

  if (periodType === "PROMOTIONAL") return "promotional";
  if (periodType === "TRIAL") return "trial";
  if (ent) return "paid";
  return null;
}

function extractExpirationDate(customerInfo: CustomerInfo): Date | null {
  const ent =
    customerInfo.entitlements.active[ENTITLEMENT_PRO_ACCESS] ??
    customerInfo.entitlements.all[ENTITLEMENT_PRO_ACCESS];

  const raw = (ent as { expirationDate?: string } | undefined)?.expirationDate;
  if (!raw) return null;
  const date = typeof raw === "string" ? parseISO(raw) : raw;
  return isValid(date) ? date : null;
}
