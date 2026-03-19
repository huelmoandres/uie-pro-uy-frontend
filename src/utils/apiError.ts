/**
 * Códigos de error de dominio del backend.
 * Ver backend/src/common/errors/domain.errors.ts para el catálogo completo.
 */
export const DOMAIN_ERROR_CODES = {
  /** Cuota de IA agotada → redirigir a Paywall */
  DEC_004: "DEC_004",
  /** Suscripción inactiva */
  PAY_001: "PAY_001",
  /** Límite de expediente gratuito */
  EXP_007: "EXP_007",
  /** Token inválido o expirado */
  AUTH_001: "AUTH_001",
} as const;

type ApiErrorResponse = {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
      errorCode?: string;
    };
  };
};

/**
 * Extrae el errorCode de una respuesta de API.
 */
export function extractApiErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object" || !("response" in err)) {
    return undefined;
  }
  return (err as ApiErrorResponse).response?.data?.errorCode;
}

/**
 * Indica si el error es DEC_004 (cuota IA agotada) o 402.
 * Usar para redirigir al Paywall en lugar de mostrar mensaje genérico.
 */
export function isDecreeQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("response" in err)) return false;
  const r = (err as ApiErrorResponse).response;
  const code = r?.data?.errorCode;
  const status = r?.status;
  return code === DOMAIN_ERROR_CODES.DEC_004 || status === 402;
}

/**
 * @deprecated Usar isDecreeQuotaError para consistencia con errorCode.
 * Indica si el error es un 402 (quota/cuota excedida).
 */
export function isQuotaError(err: unknown): boolean {
  return isDecreeQuotaError(err);
}

/**
 * Indica si el error requiere mostrar Paywall
 * (suscripción inactiva o límite free alcanzado).
 */
export function isPaywallRequiredError(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("response" in err)) return false;
  const r = (err as ApiErrorResponse).response;
  const code = r?.data?.errorCode;
  return (
    code === DOMAIN_ERROR_CODES.PAY_001 || code === DOMAIN_ERROR_CODES.EXP_007
  );
}

/**
 * Extrae el mensaje de error de una respuesta de API (Axios u otro cliente HTTP).
 */
export function extractApiErrorMessage(
  err: unknown,
  fallback: string = "Ocurrió un error. Intentá de nuevo.",
): string {
  if (!err || typeof err !== "object" || !("response" in err)) {
    return fallback;
  }
  const data = (err as ApiErrorResponse).response?.data;
  const m = data?.message;
  if (Array.isArray(m) && m.length > 0) {
    return String(m[0]);
  }
  if (typeof m === "string") {
    return m;
  }
  return fallback;
}
