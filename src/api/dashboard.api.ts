import { apiClient } from "./client";
import type { IDashboardSummary } from "@app-types/dashboard.types";

export const DashboardApi = {
  getSummary: async (): Promise<IDashboardSummary> => {
    const { data } =
      await apiClient.get<IDashboardSummary>("/dashboard/summary");
    return data;
  },
};
