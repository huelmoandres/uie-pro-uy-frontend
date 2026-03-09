import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from '@api/dashboard.api';

const QUERY_KEY = ['dashboard-summary'] as const;

export function useDashboard() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: DashboardApi.getSummary,
        staleTime: 1000 * 60 * 2,
    });
}
