/**
 * Helpers para SubscriptionContext (RevenueCat init, bypass, atributos).
 */
import Constants from "expo-constants";
import type { Dispatch, SetStateAction } from "react";
import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import { SUBSCRIPTION_BYPASS_EMAILS } from "@/constants/revenuecat";

const REVENUECAT_API_KEY_IOS =
  Constants.expoConfig?.extra?.revenueCatIos ??
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ??
  "";
const REVENUECAT_API_KEY_ANDROID =
  Constants.expoConfig?.extra?.revenueCatAndroid ??
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ??
  "";

/**
 * Cuando es true, los emails de SUBSCRIPTION_BYPASS_EMAILS no reciben acceso forzado.
 * Solo para dev/QA local — no desactivar bypass en builds de reviewers si dependen de él.
 */
export function isSubscriptionBypassDisabled(): boolean {
  const extra = Constants.expoConfig?.extra as
    | { disableSubscriptionBypass?: boolean }
    | undefined;
  if (extra?.disableSubscriptionBypass === true) return true;
  const raw = process.env.EXPO_PUBLIC_DISABLE_SUBSCRIPTION_BYPASS ?? "";
  const s = String(raw).toLowerCase().trim();
  return s === "1" || s === "true" || s === "yes";
}

/** Email está en la lista de bypass (sin mirar el flag de desactivación). */
export function isEmailOnBypassList(email: string | null | undefined): boolean {
  const lower = email?.trim().toLowerCase();
  return !!lower && SUBSCRIPTION_BYPASS_EMAILS.includes(lower);
}

export function isBypassEmail(email: string | null | undefined): boolean {
  if (isSubscriptionBypassDisabled()) return false;
  return isEmailOnBypassList(email);
}

export function buildRevenueCatAttributes(
  email?: string | null,
  name?: string | null,
): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (email?.trim()) attrs.$email = email.trim();
  if (name?.trim()) attrs.$displayName = name.trim();
  return attrs;
}

export function getRevenueCatApiKey(): string {
  return Platform.OS === "ios"
    ? REVENUECAT_API_KEY_IOS
    : REVENUECAT_API_KEY_ANDROID;
}

type SetState<T> = Dispatch<SetStateAction<T>>;

export function resetToNoAccess(
  setIsLoading: SetState<boolean>,
  setIsPro: SetState<boolean>,
  setIsInTrial: SetState<boolean>,
  setCustomerInfo: SetState<CustomerInfo | null>,
  clearCustomerInfo = false,
): void {
  setIsLoading(false);
  setIsPro(false);
  setIsInTrial(false);
  if (clearCustomerInfo) setCustomerInfo(null);
}

export function setBypassAccess(
  setIsLoading: SetState<boolean>,
  setIsPro: SetState<boolean>,
  setIsInTrial: SetState<boolean>,
): void {
  setIsLoading(false);
  setIsPro(true);
  setIsInTrial(false);
}
