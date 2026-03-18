import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ExpedienteService } from "@services";
import type { IPaginatedExpedientes } from "@app-types/expediente.types";
import type { InfiniteData } from "@tanstack/react-query";

function isInfiniteData(
  data: unknown,
): data is InfiniteData<IPaginatedExpedientes> {
  return (
    typeof data === "object" &&
    data !== null &&
    "pages" in data &&
    Array.isArray((data as InfiniteData<IPaginatedExpedientes>).pages)
  );
}

export function usePinExpediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ iue, isPinned }: { iue: string; isPinned: boolean }) =>
      ExpedienteService.pin(iue, isPinned),

    onMutate: async ({ iue, isPinned }) => {
      await queryClient.cancelQueries({
        queryKey: ExpedienteService.queryKeys.all,
      });

      const previous = queryClient.getQueriesData({
        queryKey: ExpedienteService.queryKeys.all,
      });

      queryClient.setQueriesData(
        { queryKey: ExpedienteService.queryKeys.all },
        (old: unknown) => {
          if (!old) return old;
          if (isInfiniteData(old)) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((e) =>
                  e.iue === iue ? { ...e, isPinned } : e,
                ),
              })),
            };
          }
          const paginated = old as IPaginatedExpedientes;
          return {
            ...paginated,
            data: paginated.data.map((e) =>
              e.iue === iue ? { ...e, isPinned } : e,
            ),
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
