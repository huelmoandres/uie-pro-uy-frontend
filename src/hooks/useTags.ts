import { useQuery } from '@tanstack/react-query';
import { TagService } from '@services';
import type { ITag } from '@app-types/tag.types';

/**
 * Fetches and caches the current user's tag list.
 * Returns the tags sorted alphabetically (backend already does this, just in case).
 */
export function useTags() {
    return useQuery<ITag[]>({
        queryKey: TagService.queryKeys.lists(),
        queryFn: () => TagService.getAll(),
        staleTime: 5 * 60 * 1000, // 5 min — tags rarely change
    });
}
