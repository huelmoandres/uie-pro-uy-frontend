import { useQuery } from "@tanstack/react-query";
import { TributoService } from "@services";
import type { ITributosQuery } from "@services/TributoService";

/**
 * Hook para obtener tributos judiciales del Vademécum.
 * Sin year: año actual (o el más reciente si no hay).
 */
export function useTributos(params: ITributosQuery = {}) {
  return useQuery({
    queryKey: TributoService.queryKeys.list(params),
    queryFn: () => TributoService.getAll(params),
    staleTime: 1000 * 60 * 60, // 1h - datos estáticos
  });
}
