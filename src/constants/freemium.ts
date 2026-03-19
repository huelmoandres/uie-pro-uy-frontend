import Constants from "expo-constants";

function parseFreeExpedientesLimit(): number {
  const raw =
    Constants.expoConfig?.extra?.freeExpedientesLimit ??
    process.env.EXPO_PUBLIC_FREE_EXPEDIENTES_LIMIT ??
    "1";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

/**
 * Config freemium centralizada para evitar hardcodes.
 * Cambiar EXPO_PUBLIC_FREE_EXPEDIENTES_LIMIT permite ajustar estrategia rápido.
 */
export const FREEMIUM_POLICY = {
  freeExpedientesLimit: parseFreeExpedientesLimit(),
} as const;

