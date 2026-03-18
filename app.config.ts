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
  const revenueCatIos = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "";
  const revenueCatAndroid =
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "";

  return {
    ...base,
    name: isProduction ? "IUE Pro Uy" : "IUE Pro Uy (Dev)",
    slug: base.slug ?? "iue-pro-uy",
    scheme: isProduction ? "expedientes" : "expedientes-dev",
    extra: {
      ...base.extra,
      apiUrl,
      revenueCatIos,
      revenueCatAndroid,
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
