import {
    getExpedientes,
    getExpedienteById,
    followExpediente,
    unfollowExpediente
} from '@api/expedientes.api';
import type {
    IExpediente,
    IExpedientesQuery,
    IPaginatedResponse
} from '@app-types/expediente.types';

export class ExpedienteService {
    /**
     * Centralized query keys for TanStack Query
     */
    static readonly queryKeys = {
        all: ['expedientes'] as const,
        lists: () => [...ExpedienteService.queryKeys.all, 'list'] as const,
        list: (params: IExpedientesQuery) => [...ExpedienteService.queryKeys.lists(), params] as const,
        details: () => [...ExpedienteService.queryKeys.all, 'detail'] as const,
        detail: (id: string) => [...ExpedienteService.queryKeys.details(), id] as const,
    };

    static async getAll(params: IExpedientesQuery): Promise<IPaginatedResponse<IExpediente>> {
        return await getExpedientes(params);
    }

    static async getById(id: string): Promise<IExpediente> {
        return await getExpedienteById(id);
    }

    static async unfollow(id: string): Promise<void> {
        return await unfollowExpediente(id);
    }

    static async follow(iue: string): Promise<void> {
        return await followExpediente(iue);
    }
}
