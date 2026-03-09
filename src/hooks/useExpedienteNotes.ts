import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { ExpedienteService } from '@services';
import type { IPaginatedExpedientes } from '@app-types/expediente.types';

// ─── Query key ───────────────────────────────────────────────────────────────

const followQueryKey = (iue: string) => ['expediente-follow', iue] as const;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useExpedienteNotes(iue: string) {
    const queryClient = useQueryClient();

    /**
     * Reads the cached notes from the expediente list (fast path).
     * Returns undefined if the expediente hasn't been loaded in a list yet.
     */
    const getListCachedNotes = (): string | undefined => {
        const queries = queryClient.getQueriesData<IPaginatedExpedientes>({
            queryKey: ExpedienteService.queryKeys.all,
        });
        for (const [, data] of queries) {
            const found = data?.data?.find((e) => e.iue === iue);
            if (found !== undefined) return found.notes ?? '';
        }
        return undefined;
    };

    /**
     * Fetches follow data (isPinned + notes) from the backend.
     * Uses the list cache as initialData to avoid a visible loading flash
     * when the user navigated through the list before opening the detail.
     */
    const { data: followData } = useQuery({
        queryKey: followQueryKey(iue),
        queryFn: () => ExpedienteService.getFollowData(iue),
        staleTime: 1000 * 60 * 5, // 5 min — notes rarely change from outside this device
        initialData: () => {
            const cached = getListCachedNotes();
            if (cached === undefined) return undefined;
            return { notes: cached || null, isPinned: false };
        },
        initialDataUpdatedAt: () => {
            // Mark initial data as fresh only if the list cache was recently populated
            const queries = queryClient.getQueriesData<IPaginatedExpedientes>({
                queryKey: ExpedienteService.queryKeys.all,
            });
            return queries.length > 0 ? Date.now() : 0;
        },
    });

    const notes = followData?.notes ?? null;

    // ── Save mutation ─────────────────────────────────────────────────────────

    const mutation = useMutation({
        mutationFn: (newNotes: string | null) => ExpedienteService.updateNotes(iue, newNotes),

        onSuccess: (_data, newNotes) => {
            // Keep the dedicated follow query in sync
            queryClient.setQueryData(followQueryKey(iue), (old: typeof followData) =>
                old ? { ...old, notes: newNotes } : old,
            );

            // Keep all list caches in sync so the list screen stays accurate
            queryClient.setQueriesData<IPaginatedExpedientes>(
                { queryKey: ExpedienteService.queryKeys.all },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((e) => (e.iue === iue ? { ...e, notes: newNotes } : e)),
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

    return { mutation, notes };
}
