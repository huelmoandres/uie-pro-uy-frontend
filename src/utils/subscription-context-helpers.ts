/**
 * Helpers para SubscriptionContext (RevenueCat init, bypass, atributos).
 */
import type { Dispatch, SetStateAction } from "react";
import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import { SUBSCRIPTION_BYPASS_EMAILS } from "@/constants/revenuecat";

const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "";
const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "";

export function isBypassEmail(email: string | null | undefined): boolean {
  const lower = email?.trim().toLowerCase();
  return !!lower && SUBSCRIPTION_BYPASS_EMAILS.includes(lower);
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
