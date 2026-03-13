import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { DashboardApi } from "@api/dashboard.api";

const QUERY_KEY_BASE = ["dashboard-summary"] as const;

export function useDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: [...QUERY_KEY_BASE, userId],
    queryFn: DashboardApi.getSummary,
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
  });
}
