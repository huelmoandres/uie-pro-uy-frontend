import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { ExpedienteService } from "@services";
import type { IExpedientesQuery } from "@app-types/expediente.types";

/**
 * Hook for fetching a paginated list of expedientes.
 * Incluye userId en la query key para evitar mostrar datos de otro usuario al cambiar de cuenta.
 */
export function useExpedientes(params: IExpedientesQuery) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: [...ExpedienteService.queryKeys.list(params), userId],
    queryFn: () => ExpedienteService.getAll(params),
    enabled: !!userId,
  });
}
