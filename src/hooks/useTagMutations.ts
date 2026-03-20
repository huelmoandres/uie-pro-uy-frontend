import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useAuth } from "@context/AuthContext";
import { TagService , ExpedienteService } from "@services";
import { useAnalytics } from "@hooks/useAnalytics";
import type {
  ITag,
  ICreateTagPayload,
  IUpdateTagPayload,
} from "@app-types/tag.types";
import type { IPaginatedExpedientes } from "@app-types/expediente.types";

// Tipo del snapshot de queries para rollback en optimistic updates
type QuerySnapshot = [QueryKey, IPaginatedExpedientes | undefined][];

const tagsListKey = (userId: string | null) =>
  userId ? [...TagService.queryKeys.lists(), userId] : TagService.queryKeys.lists();

/**
 * Provides CRUD mutations for tags and assign/unassign operations.
 * Usa userId en las claves de cache para coincidir con useTags.
 */
export function useTagMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const listKey = tagsListKey(userId);
  const { trackEvent } = useAnalytics();

  const createTag = useMutation<ITag, Error, ICreateTagPayload>({
    mutationFn: (payload) => TagService.create(payload),
    onSuccess: (newTag) => {
      if (!userId) return;
      trackEvent("tag_created");
      queryClient.setQueryData<ITag[]>(
        listKey,
        (old = []) =>
          [...old, newTag].sort((a, b) => a.name.localeCompare(b.name)),
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: `Etiqueta "${newTag.name}" creada.`,
      });
    },
    onError: (err) => {
      const message = err.message.includes("409")
        ? "Ya existe una etiqueta con ese nombre."
        : "No se pudo crear la etiqueta. Intentá de nuevo.";
      Toast.show({ type: "error", text1: message });
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
      if (!userId) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: TagService.queryKeys.all });
      const previous = queryClient.getQueryData<ITag[]>(listKey);

      queryClient.setQueryData<ITag[]>(
        listKey,
        (old = []) =>
          old
            .map((t) => (t.id === tagId ? { ...t, ...payload } : t))
            .sort((a, b) => a.name.localeCompare(b.name)),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined && userId) {
        queryClient.setQueryData(listKey, context.previous);
      }
      Toast.show({
        type: "error",
        text1: "No se pudo actualizar la etiqueta.",
      });
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
      if (!userId) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: TagService.queryKeys.all });
      const previous = queryClient.getQueryData<ITag[]>(listKey);

      queryClient.setQueryData<ITag[]>(
        listKey,
        (old = []) => old.filter((t) => t.id !== tagId),
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
      if (context?.previous !== undefined && userId) {
        queryClient.setQueryData(listKey, context.previous);
      }
      Toast.show({ type: "error", text1: "No se pudo eliminar la etiqueta." });
    },
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Etiqueta eliminada." });
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
      if (!userId) return { previous: [] };
      await queryClient.cancelQueries({
        queryKey: ExpedienteService.queryKeys.all,
      });

      const tags = queryClient.getQueryData<ITag[]>(listKey);
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
                e.iue === iue ? { ...e, tags: [...(e.tags ?? []), tag] } : e,
              ),
            };
          },
        );
      }

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
      Toast.show({ type: "error", text1: "No se pudo asignar la etiqueta." });
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
      await queryClient.cancelQueries({
        queryKey: ExpedienteService.queryKeys.all,
      });

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
      context?.previous.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
      Toast.show({
        type: "error",
        text1: "No se pudo desasignar la etiqueta.",
      });
    },
  });

  return { createTag, updateTag, deleteTag, assignTag, unassignTag };
}
