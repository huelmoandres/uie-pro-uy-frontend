import { useMutation } from "@tanstack/react-query";
import { DecreesApi } from "@api/decrees.api";

/**
 * Mutation hook para generar el resumen de IA de un decreto.
 * Usa `useMutation` porque la primera llamada tiene efecto secundario
 * (consumo de API de IA). Las llamadas siguientes son instantáneas (caché en DB).
 */
export function useDecreeSummary() {
  return useMutation({
    mutationFn: (decreeId: string) => DecreesApi.summarize(decreeId),
  });
}
