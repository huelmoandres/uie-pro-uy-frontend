import type {
    IExpediente,
    IExpedientesQuery,
    IPaginatedExpedientes,
} from '@app-types/expediente.types';
import { apiClient } from './client';

// ─── Expedientes API ──────────────────────────────────────────────────────────

/**
 * Fetches a paginated and filtered list of followed expedientes.
 */
export async function getExpedientes(
    params: IExpedientesQuery = {},
): Promise<IPaginatedExpedientes> {
    const { data } = await apiClient.get<IPaginatedExpedientes>('/expedientes', { params });
    return data;
}

/**
 * Fetches a single expediente by its IUE, including all movements.
 */
export async function getExpedienteById(iue: string): Promise<IExpediente> {
    const { data } = await apiClient.get<IExpediente>(`/expedientes/${encodeURIComponent(iue)}`);
    return data;
}

/**
 * Adds an expediente to the user's follow list by IUE.
 */
export async function followExpediente(iue: string): Promise<void> {
    await apiClient.post(`/expedientes/${encodeURIComponent(iue)}/follow`);
}

/**
 * Removes an expediente from the user's follow list.
 */
export async function unfollowExpediente(iue: string): Promise<void> {
    await apiClient.delete(`/expedientes/${encodeURIComponent(iue)}/follow`);
}

/**
 * Triggers a manual sync for a single expediente.
 */
export async function syncExpediente(iue: string): Promise<void> {
    await apiClient.post(`/expedientes/${encodeURIComponent(iue)}/sync`);
}

/**
 * Toggles the pin (favorite) status of a followed expediente.
 */
export async function pinExpediente(iue: string, isPinned: boolean): Promise<void> {
    await apiClient.patch(`/expedientes/${encodeURIComponent(iue)}/follow`, { isPinned });
}

/**
 * Updates the personal notes for a followed expediente.
 */
export async function updateExpedienteNotes(iue: string, notes: string | null): Promise<void> {
    await apiClient.patch(`/expedientes/${encodeURIComponent(iue)}/follow`, { notes });
}

/**
 * Fetches the current user's follow data (isPinned, notes) for a single expediente.
 * Returns null if the user is not following it.
 */
export async function getExpedienteFollowData(
    iue: string,
): Promise<{ isPinned: boolean; notes: string | null } | null> {
    const { data } = await apiClient.get<{ isPinned: boolean; notes: string | null } | null>(
        `/expedientes/${encodeURIComponent(iue)}/follow`,
    );
    return data;
}
