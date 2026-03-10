import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { TagService } from '@services';
import { ExpedienteService } from '@services';
import type { ITag, ICreateTagPayload, IUpdateTagPayload } from '@app-types/tag.types';
import type { IPaginatedExpedientes } from '@app-types/expediente.types';

// Tipo del snapshot de queries para rollback en optimistic updates
type QuerySnapshot = [QueryKey, IPaginatedExpedientes | undefined][];

/**
 * Provides CRUD mutations for tags and assign/unassign operations.
 *
 * - createTag: creates a new tag, updates cache directly on success.
 * - updateTag: updates name/color with optimistic update + rollback on error.
 * - deleteTag: deletes a tag with optimistic removal, also cleans expediente caches.
 * - assignTag: assigns a tag to an expediente with optimistic update.
 * - unassignTag: removes a tag from an expediente with optimistic update.
 */
export function useTagMutations() {
    const queryClient = useQueryClient();

    const createTag = useMutation<ITag, Error, ICreateTagPayload>({
        mutationFn: (payload) => TagService.create(payload),
        onSuccess: (newTag) => {
            queryClient.setQueryData<ITag[]>(
                TagService.queryKeys.lists(),
                (old = []) => [...old, newTag].sort((a, b) => a.name.localeCompare(b.name)),
            );
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ type: 'success', text1: `Etiqueta "${newTag.name}" creada.` });
        },
        onError: (err) => {
            const message = err.message.includes('409')
                ? 'Ya existe una etiqueta con ese nombre.'
                : 'No se pudo crear la etiqueta. Intentá de nuevo.';
            Toast.show({ type: 'error', text1: message });
        },
    });

    const updateTag = useMutation<
        ITag,
        Error,
        { tagId: string; payload: IUpdateTagPayload },
        { previous: ITag[] | undefined }
    >({
        mutationFn: ({ tagId, payload }) => TagService.update(tagId, payload),
        onMutate: async ({ tagId, payload }) => {
            await queryClient.cancelQueries({ queryKey: TagService.queryKeys.all });
            const previous = queryClient.getQueryData<ITag[]>(TagService.queryKeys.lists());

            queryClient.setQueryData<ITag[]>(TagService.queryKeys.lists(), (old = []) =>
                old
                    .map((t) => (t.id === tagId ? { ...t, ...payload } : t))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            );

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(TagService.queryKeys.lists(), context.previous);
            }
            Toast.show({ type: 'error', text1: 'No se pudo actualizar la etiqueta.' });
        },
    });

    const deleteTag = useMutation<
        void,
        Error,
        string,
        { previous: ITag[] | undefined }
    >({
        mutationFn: (tagId) => TagService.remove(tagId),
        onMutate: async (tagId) => {
            await queryClient.cancelQueries({ queryKey: TagService.queryKeys.all });
            const previous = queryClient.getQueryData<ITag[]>(TagService.queryKeys.lists());

            queryClient.setQueryData<ITag[]>(TagService.queryKeys.lists(), (old = []) =>
                old.filter((t) => t.id !== tagId),
            );

            // Remove from all expediente caches too
            queryClient.setQueriesData<IPaginatedExpedientes>(
                { queryKey: ExpedienteService.queryKeys.all },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((e) => ({
                            ...e,
                            tags: e.tags?.filter((t) => t.id !== tagId) ?? [],
                        })),
                    };
                },
            );

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(TagService.queryKeys.lists(), context.previous);
            }
            Toast.show({ type: 'error', text1: 'No se pudo eliminar la etiqueta.' });
        },
        onSuccess: () => {
            Toast.show({ type: 'success', text1: 'Etiqueta eliminada.' });
        },
    });

    const assignTag = useMutation<
        void,
        Error,
        { iue: string; tagId: string },
        { previous: QuerySnapshot }
    >({
        mutationFn: ({ iue, tagId }) => TagService.assign(iue, tagId),
        onMutate: async ({ iue, tagId }) => {
            await queryClient.cancelQueries({ queryKey: ExpedienteService.queryKeys.all });

            const tags = queryClient.getQueryData<ITag[]>(TagService.queryKeys.lists());
            const tag = tags?.find((t) => t.id === tagId);

            const previous = queryClient.getQueriesData<IPaginatedExpedientes>({
                queryKey: ExpedienteService.queryKeys.all,
            }) as QuerySnapshot;

            if (tag) {
                queryClient.setQueriesData<IPaginatedExpedientes>(
                    { queryKey: ExpedienteService.queryKeys.all },
                    (old) => {
                        if (!old) return old;
                        return {
                            ...old,
                            data: old.data.map((e) =>
                                e.iue === iue
                                    ? { ...e, tags: [...(e.tags ?? []), tag] }
                                    : e,
                            ),
                        };
                    },
                );
            }

            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
            Toast.show({ type: 'error', text1: 'No se pudo asignar la etiqueta.' });
        },
    });

    const unassignTag = useMutation<
        void,
        Error,
        { iue: string; tagId: string },
        { previous: QuerySnapshot }
    >({
        mutationFn: ({ iue, tagId }) => TagService.unassign(iue, tagId),
        onMutate: async ({ iue, tagId }) => {
            await queryClient.cancelQueries({ queryKey: ExpedienteService.queryKeys.all });

            const previous = queryClient.getQueriesData<IPaginatedExpedientes>({
                queryKey: ExpedienteService.queryKeys.all,
            }) as QuerySnapshot;

            queryClient.setQueriesData<IPaginatedExpedientes>(
                { queryKey: ExpedienteService.queryKeys.all },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((e) =>
                            e.iue === iue
                                ? { ...e, tags: e.tags?.filter((t) => t.id !== tagId) ?? [] }
                                : e,
                        ),
                    };
                },
            );

            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
            Toast.show({ type: 'error', text1: 'No se pudo desasignar la etiqueta.' });
        },
    });

    return { createTag, updateTag, deleteTag, assignTag, unassignTag };
}
