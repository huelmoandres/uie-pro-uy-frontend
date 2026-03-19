import {
  getExpedientes,
  getTodayMovementExpedientes,
  getExpedienteById,
  followExpediente,
  unfollowExpediente,
  pinExpediente,
  updateExpedienteNotes,
  getExpedienteFollowData,
} from "@api/expedientes.api";
import type {
  IExpediente,
  IExpedientesQuery,
  IPaginatedResponse,
} from "@app-types/expediente.types";

export class ExpedienteService {
  /**
   * Centralized query keys for TanStack Query.
   * Always use these to avoid invalidation mismatches.
   */
  static readonly queryKeys = {
    all: ["expedientes"] as const,
    lists: () => [...ExpedienteService.queryKeys.all, "list"] as const,
    list: (params: IExpedientesQuery) =>
      [...ExpedienteService.queryKeys.lists(), params] as const,
    todayMovementsLists: () =>
      [...ExpedienteService.queryKeys.all, "today-movements-list"] as const,
    todayMovementsList: (params: IExpedientesQuery) =>
      [...ExpedienteService.queryKeys.todayMovementsLists(), params] as const,
    details: () => [...ExpedienteService.queryKeys.all, "detail"] as const,
    detail: (id: string) =>
      [...ExpedienteService.queryKeys.details(), id] as const,
  };

  static async getAll(
    params: IExpedientesQuery,
  ): Promise<IPaginatedResponse<IExpediente>> {
    return await getExpedientes(params);
  }

  static async getTodayMovements(
    params: IExpedientesQuery,
  ): Promise<IPaginatedResponse<IExpediente>> {
    return await getTodayMovementExpedientes(params);
  }

  static async getById(id: string): Promise<IExpediente> {
    return await getExpedienteById(id);
  }

  static async follow(iue: string): Promise<void> {
    return await followExpediente(iue);
  }

  static async unfollow(iue: string): Promise<void> {
    return await unfollowExpediente(iue);
  }

  static async pin(iue: string, isPinned: boolean): Promise<void> {
    return await pinExpediente(iue, isPinned);
  }

  static async updateNotes(iue: string, notes: string | null): Promise<void> {
    return await updateExpedienteNotes(iue, notes);
  }

  static async getFollowData(
    iue: string,
  ): Promise<{ isPinned: boolean; notes: string | null } | null> {
    return await getExpedienteFollowData(iue);
  }
}
