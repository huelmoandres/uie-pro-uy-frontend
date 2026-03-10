/**
 * RevenueCat configuration for IUE Pro subscriptions.
 * Configure these in RevenueCat Dashboard and App Store Connect.
 *
 * Env vars (add to .env):
 *   EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxx
 *   EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxx
 */

/** Entitlement ID — unlocks pro_access features */
export const ENTITLEMENT_PRO_ACCESS = 'pro_access';

/** Product ID for monthly subscription — must match App Store Connect y RevenueCat */
export const PRODUCT_ID_MONTHLY = 'com.huelmoandres.iueprouy.mensual';

/** Display name for the subscription (shown in Paywall) */
export const SUBSCRIPTION_DISPLAY_NAME = 'Suscripción Mensual Pro';

/** Free trial: 7 días — configurado en App Store Connect. No hay tier gratuito; la app se compra y da acceso completo sin límites. */
