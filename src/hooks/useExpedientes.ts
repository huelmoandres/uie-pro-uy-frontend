import { useQuery } from '@tanstack/react-query';
import { ExpedienteService } from '@services';
import type { IExpedientesQuery } from '@app-types/expediente.types';

/**
 * Hook for fetching a paginated list of expedientes.
 */
export function useExpedientes(params: IExpedientesQuery) {
    return useQuery({
        queryKey: ExpedienteService.queryKeys.list(params),
        queryFn: () => ExpedienteService.getAll(params),
    });
}
