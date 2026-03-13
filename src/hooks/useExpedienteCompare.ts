import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { ExpedienteService } from "@services";
import type { IExpediente } from "@app-types/expediente.types";

/**
 * Fetches multiple expedientes in parallel for the compare view.
 * Incluye userId en la query key para evitar mezcla de datos entre usuarios.
 */
export function useExpedienteCompare(iues: string[]) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const results = useQueries({
    queries: iues.map((iue) => ({
      queryKey: [...ExpedienteService.queryKeys.detail(iue), userId],
      queryFn: () => ExpedienteService.getById(iue),
      enabled: !!iue && !!userId,
    })),
  });

  const expedientes: (IExpediente | null)[] = results.map((r) => r.data ?? null);
  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const refetch = () => results.forEach((r) => r.refetch());

  return { expedientes, isLoading, isError, refetch };
}
