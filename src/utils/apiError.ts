/**
 * Indica si el error es un 402 (quota/cuota excedida) de una respuesta Axios.
 */
export function isQuotaError(err: unknown): boolean {
  return (
    err != null &&
    typeof err === "object" &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 402
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
  const data = (
    err as { response?: { data?: { message?: string | string[] } } }
  ).response?.data;
  const m = data?.message;
  if (Array.isArray(m) && m.length > 0) {
    return String(m[0]);
  }
  if (typeof m === "string") {
    return m;
  }
  return fallback;
}
