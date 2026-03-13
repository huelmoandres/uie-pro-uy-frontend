import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { ExpedienteService } from "@services";

/**
 * Hook for fetching a single expediente's details.
 * Incluye userId en la query key para evitar mostrar datos de otro usuario al cambiar de cuenta.
 */
export function useExpedienteDetail(id: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: [...ExpedienteService.queryKeys.detail(id), userId],
    queryFn: () => ExpedienteService.getById(id),
    enabled: !!id && !!userId,
  });
}
