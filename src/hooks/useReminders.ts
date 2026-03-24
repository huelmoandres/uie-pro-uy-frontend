import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { ReminderService } from "@services";
import { useAccessPolicy } from "./useAccessPolicy";
import type {
  IRemindersQuery,
  IRemindersListResponse,
} from "@app-types/reminder.types";

const REMINDERS_PAGE_SIZE = 15;

/**
 * Hook para obtener la lista paginada de recordatorios del usuario.
 * Incluye userId en la query key para evitar mostrar datos de otro usuario al cambiar de cuenta.
 */
export function useReminders(params: IRemindersQuery = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { hasPremiumAccess } = useAccessPolicy();

  return useQuery({
    queryKey: [...ReminderService.queryKeys.list(params), userId],
    queryFn: () => ReminderService.getAll(params),
    staleTime: 1000 * 60 * 2,
    enabled: !!userId && hasPremiumAccess,
  });
}

/**
 * Hook para lista infinita de recordatorios (paginación con "Ver más").
 * Incluye userId en la query key para evitar mostrar datos de otro usuario al cambiar de cuenta.
 */
export function useRemindersInfinite(
  params: Omit<IRemindersQuery, "page"> = {},
) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { hasPremiumAccess } = useAccessPolicy();

  return useInfiniteQuery({
    queryKey: [
      ...ReminderService.queryKeys.lists(),
      "infinite",
      params,
      userId,
    ],
    queryFn: async ({ pageParam = 1 }): Promise<IRemindersListResponse> => {
      return ReminderService.getAll({
        ...params,
        page: pageParam,
        limit: REMINDERS_PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId && hasPremiumAccess,
  });
}
