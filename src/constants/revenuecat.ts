/**
 * RevenueCat configuration for IUE Pro subscriptions.
 * Configure these in RevenueCat Dashboard and App Store Connect.
 *
 * Env vars (add to .env):
 *   EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxx
 *   EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxx
 */

/** Entitlement ID — unlocks pro_access features */
export const ENTITLEMENT_PRO_ACCESS = "pro_access";

/** Product ID for monthly subscription — must match App Store Connect y RevenueCat */
export const PRODUCT_ID_MONTHLY = "com.huelmoandres.iueprouy.mensual";

/** Display name for the subscription (shown in Paywall) */
export const SUBSCRIPTION_DISPLAY_NAME = "Suscripción Mensual Pro";

/** Precio mostrado en el Paywall (debe coincidir con App Store Connect) */
export const SUBSCRIPTION_PRICE = "12.99 USD";

/** Días de prueba gratuita configurados en App Store Connect */
export const SUBSCRIPTION_TRIAL_DAYS = 7;

/** Free trial: 7 días — configurado en App Store Connect. Luego aplica modelo freemium (1 expediente gratis + features premium). */

/**
 * Emails que no requieren suscripción (admins, testers, reviewers).
 * Editá esta lista y hacé `eas update` — no requiere rebuild.
 */
export const SUBSCRIPTION_BYPASS_EMAILS: string[] = [
  "alatallada@ferreirayasociados.com.uy",
  "user@iueprouy.com",
]
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
