/**
 * Configuración dinámica de Expo según APP_ENV.
 * Permite tener IUE Pro Uy (prod) e IUE Pro Uy (Dev) instaladas en el mismo dispositivo
 * sin colisión de bundle ID ni scheme de deep linking.
 */
import type { ConfigContext, ExpoConfig } from "expo/config";

const APP_ENV = process.env.APP_ENV ?? "development";
const isProduction = APP_ENV === "production";

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  const freeExpedientesLimit = parseInt(
    process.env.EXPO_PUBLIC_FREE_EXPEDIENTES_LIMIT ?? "1",
    10,
  );
  const revenueCatIos = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "";
  const revenueCatAndroid =
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "";
  const disableSubscriptionBypass =
    process.env.EXPO_PUBLIC_DISABLE_SUBSCRIPTION_BYPASS === "1" ||
    process.env.EXPO_PUBLIC_DISABLE_SUBSCRIPTION_BYPASS === "true";
  const postHogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
  const postHogHost =
    process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

  return {
    ...base,
    name: isProduction ? "IUE Pro Uy" : "IUE Pro Uy (Dev)",
    slug: base.slug ?? "iue-pro-uy",
    scheme: isProduction ? "expedientes" : "expedientes-dev",
    extra: {
      ...base.extra,
      apiUrl,
      freeExpedientesLimit,
      revenueCatIos,
      revenueCatAndroid,
      disableSubscriptionBypass,
      postHogApiKey,
      postHogHost,
    },
    ios: {
      ...base.ios,
      bundleIdentifier: isProduction ? "com.iueprouy.app" : "com.iueprouy.dev",
    },
    android: {
      ...base.android,
      package: isProduction ? "com.iueprouy.app" : "com.iueprouy.dev",
    },
  };
};
