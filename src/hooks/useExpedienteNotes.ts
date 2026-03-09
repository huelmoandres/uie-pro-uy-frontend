import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { ExpedienteService } from '@services';
import type { IPaginatedExpedientes } from '@app-types/expediente.types';

export function useExpedienteNotes(iue: string) {
    const queryClient = useQueryClient();

    /**
     * Reads the current notes for this expediente from the paginated list cache.
     * Returns an empty string if the expediente is not yet in any cached page.
     */
    const getCachedNotes = (): string => {
        const queries = queryClient.getQueriesData<IPaginatedExpedientes>({
            queryKey: ExpedienteService.queryKeys.all,
        });
        for (const [, data] of queries) {
            const found = data?.data?.find((e) => e.iue === iue);
            if (found !== undefined) return found.notes ?? '';
        }
        return '';
    };

    const mutation = useMutation({
        mutationFn: (notes: string | null) => ExpedienteService.updateNotes(iue, notes),

        onSuccess: (_data, notes) => {
            // Keep all list caches in sync
            queryClient.setQueriesData<IPaginatedExpedientes>(
                { queryKey: ExpedienteService.queryKeys.all },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((e) => (e.iue === iue ? { ...e, notes } : e)),
                    };
                },
            );
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ type: 'success', text1: 'Notas guardadas' });
        },

        onError: () => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo guardar. Intentá de nuevo.',
            });
        },
    });

    return { mutation, getCachedNotes };
}
