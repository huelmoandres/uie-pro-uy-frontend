import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsApi } from '@api/notifications.api';
import type { UpdateNotificationPreferencesPayload } from '@app-types/notification-preferences.types';

const QUERY_KEY = ['notification-preferences'] as const;

export function useNotificationPreferences() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: NotificationsApi.getPreferences,
        staleTime: 1000 * 60 * 5, // 5 min
    });
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateNotificationPreferencesPayload) =>
            NotificationsApi.updatePreferences(payload),
        onSuccess: (updated) => {
            // Actualiza el cache optimistamente con el valor confirmado por el servidor
            queryClient.setQueryData(QUERY_KEY, updated);
        },
    });
}
