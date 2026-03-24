import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { ExpedienteService } from "@services";
import type {
  IExpedientesQuery,
  IPaginatedExpedientes,
} from "@app-types/expediente.types";

const EXPEDIENTES_PAGE_SIZE = 20;

/**
 * Hook for fetching a paginated list of expedientes (single page).
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

/**
 * Hook para lista infinita de expedientes (Pull to Refresh + Load More).
 * Ideal para la pantalla principal: scroll al final carga más, pull down refresca.
 */
export function useExpedientesInfinite(
  params: Omit<IExpedientesQuery, "page"> = {},
  options?: { enabled?: boolean },
) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useInfiniteQuery({
    queryKey: [
      ...ExpedienteService.queryKeys.lists(),
      "infinite",
      params,
      userId,
    ],
    queryFn: async ({ pageParam = 1 }): Promise<IPaginatedExpedientes> => {
      return ExpedienteService.getAll({
        ...params,
        page: pageParam,
        limit: params.limit ?? EXPEDIENTES_PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}

/**
 * Hook para lista infinita de expedientes con movimientos de hoy.
 * Soporta los mismos filtros/paginación de la lista principal.
 */
export function useTodayMovementsExpedientesInfinite(
  params: Omit<IExpedientesQuery, "page"> = {},
  options?: { enabled?: boolean },
) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useInfiniteQuery({
    queryKey: [
      ...ExpedienteService.queryKeys.todayMovementsLists(),
      "infinite",
      params,
      userId,
    ],
    queryFn: async ({ pageParam = 1 }): Promise<IPaginatedExpedientes> => {
      return ExpedienteService.getTodayMovements({
        ...params,
        page: pageParam,
        limit: params.limit ?? EXPEDIENTES_PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}
