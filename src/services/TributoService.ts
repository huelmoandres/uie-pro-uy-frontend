import { getTributos } from "@api/tributos.api";
import type { ITributo } from "@app-types/tributo.types";

export interface ITributosQuery {
  year?: number;
}

export class TributoService {
  static readonly queryKeys = {
    all: ["tributos"] as const,
    lists: () => [...TributoService.queryKeys.all, "list"] as const,
    list: (params: ITributosQuery) =>
      [...TributoService.queryKeys.lists(), params] as const,
  };

  static async getAll(params: ITributosQuery = {}): Promise<ITributo[]> {
    return getTributos(params);
  }
}
