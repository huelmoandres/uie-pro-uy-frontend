import { useQuery } from '@tanstack/react-query';
import { AgendaApi } from '@api/agenda.api';

const QUERY_KEY = ['deadline-agenda'] as const;

export function useDeadlineAgenda() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: AgendaApi.getAgenda,
        staleTime: 1000 * 60 * 5,
    });
}
