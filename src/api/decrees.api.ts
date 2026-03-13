import { apiClient } from "./client";
import type { IDecreeSummary } from "@app-types/expediente.types";

export const DecreesApi = {
  /**
   * Genera (o devuelve desde caché) un resumen de IA para un decreto.
   * El backend solo llama a OpenAI la primera vez; el resultado queda
   * guardado en la DB para siempre.
   */
  summarize: async (decreeId: string): Promise<IDecreeSummary> => {
    const { data } = await apiClient.post<IDecreeSummary>(
      `/decrees/${decreeId}/summarize`,
    );
    return data;
  },
};
