import type { ITributo } from "@app-types/tributo.types";
import { apiClient } from "./client";

export interface ITributosParams {
  year?: number;
}

/**
 * Obtiene tributos judiciales del Vademécum.
 * Sin year: año actual (o el más reciente si no hay).
 */
export async function getTributos(
  params: ITributosParams = {},
): Promise<ITributo[]> {
  const { data } = await apiClient.get<ITributo[]>("/tributos", { params });
  return data;
}
