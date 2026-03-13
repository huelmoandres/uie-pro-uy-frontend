import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { NotificationsApi } from "@api/notifications.api";
import type { UpdateNotificationPreferencesPayload } from "@app-types/notification-preferences.types";

const QUERY_KEY_BASE = ["notification-preferences"] as const;

/**
 * Preferencias de notificaciones del usuario.
 * Incluye userId en la query key para evitar mostrar datos de otro usuario al cambiar de cuenta.
 */
export function useNotificationPreferences() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: [...QUERY_KEY_BASE, userId],
    queryFn: NotificationsApi.getPreferences,
    staleTime: 1000 * 60 * 5, // 5 min
    enabled: !!userId,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesPayload) =>
      NotificationsApi.updatePreferences(payload),
    onSuccess: (updated) => {
      if (userId) {
        queryClient.setQueryData([...QUERY_KEY_BASE, userId], updated);
      }
    },
  });
}
