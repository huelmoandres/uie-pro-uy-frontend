import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ExpedienteService } from "@services";
import type { IPaginatedExpedientes } from "@app-types/expediente.types";

export function usePinExpediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ iue, isPinned }: { iue: string; isPinned: boolean }) =>
      ExpedienteService.pin(iue, isPinned),

    onMutate: async ({ iue, isPinned }) => {
      await queryClient.cancelQueries({
        queryKey: ExpedienteService.queryKeys.all,
      });

      // Snapshot current cache for rollback
      const previous = queryClient.getQueriesData<IPaginatedExpedientes>({
        queryKey: ExpedienteService.queryKeys.all,
      });

      // Optimistic update across all paginated list caches
      queryClient.setQueriesData<IPaginatedExpedientes>(
        { queryKey: ExpedienteService.queryKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((e) => (e.iue === iue ? { ...e, isPinned } : e)),
          };
        },
      );

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, value]) =>
          queryClient.setQueryData(key, value),
        );
      }
    },
  });
}
