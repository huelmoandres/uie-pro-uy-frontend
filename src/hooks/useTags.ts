import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { TagService } from "@services";
import type { ITag } from "@app-types/tag.types";

/**
 * Fetches and caches the current user's tag list.
 * Incluye userId en la query key para evitar mostrar tags de otro usuario al cambiar de cuenta.
 */
export function useTags() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery<ITag[]>({
    queryKey: [...TagService.queryKeys.lists(), userId],
    queryFn: () => TagService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 min — tags rarely change
    enabled: !!userId,
  });
}
