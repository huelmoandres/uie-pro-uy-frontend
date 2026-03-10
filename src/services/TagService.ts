import {
    getTags,
    createTag,
    updateTag,
    deleteTag,
    assignTagToExpediente,
    removeTagFromExpediente,
} from '@api/tags.api';
import type { ITag, ICreateTagPayload, IUpdateTagPayload } from '@app-types/tag.types';

export class TagService {
    /**
     * Centralized query keys for TanStack Query.
     * Always use these to avoid invalidation mismatches.
     */
    static readonly queryKeys = {
        all: ['tags'] as const,
        lists: () => [...TagService.queryKeys.all, 'list'] as const,
    };

    static async getAll(): Promise<ITag[]> {
        return getTags();
    }

    static async create(payload: ICreateTagPayload): Promise<ITag> {
        return createTag(payload);
    }

    static async update(tagId: string, payload: IUpdateTagPayload): Promise<ITag> {
        return updateTag(tagId, payload);
    }

    static async remove(tagId: string): Promise<void> {
        return deleteTag(tagId);
    }

    static async assign(iue: string, tagId: string): Promise<void> {
        return assignTagToExpediente(iue, tagId);
    }

    static async unassign(iue: string, tagId: string): Promise<void> {
        return removeTagFromExpediente(iue, tagId);
    }
}
