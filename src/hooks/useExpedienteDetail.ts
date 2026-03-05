import { useQuery } from '@tanstack/react-query';
import { ExpedienteService } from '@services';

/**
 * Hook for fetching a single expediente's details.
 */
export function useExpedienteDetail(id: string) {
    return useQuery({
        queryKey: ExpedienteService.queryKeys.detail(id),
        queryFn: () => ExpedienteService.getById(id),
        enabled: !!id,
    });
}
