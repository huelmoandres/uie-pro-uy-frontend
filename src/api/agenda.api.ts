import { apiClient } from "./client";
import type { IAgendaItem } from "@app-types/deadline-agenda.types";

export const AgendaApi = {
  getAgenda: async (): Promise<IAgendaItem[]> => {
    const { data } = await apiClient.get<IAgendaItem[]>("/agenda");
    return data;
  },
};
