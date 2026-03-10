import { apiClient } from './client';
import type { ITag, ICreateTagPayload, IUpdateTagPayload } from '@app-types/tag.types';

// ─── Tags API ──────────────────────────────────────────────────────────────────

/** Obtiene todas las etiquetas del usuario autenticado. */
export async function getTags(): Promise<ITag[]> {
    const { data } = await apiClient.get<ITag[]>('/tags');
    return data;
}

/** Crea una nueva etiqueta. */
export async function createTag(payload: ICreateTagPayload): Promise<ITag> {
    const { data } = await apiClient.post<ITag>('/tags', payload);
    return data;
}

/** Actualiza nombre y/o color de una etiqueta. */
export async function updateTag(tagId: string, payload: IUpdateTagPayload): Promise<ITag> {
    const { data } = await apiClient.patch<ITag>(`/tags/${tagId}`, payload);
    return data;
}

/** Elimina una etiqueta (desasigna de todos los expedientes en cascada). */
export async function deleteTag(tagId: string): Promise<void> {
    await apiClient.delete(`/tags/${tagId}`);
}

/** Asigna una etiqueta a un expediente seguido. Idempotente. */
export async function assignTagToExpediente(iue: string, tagId: string): Promise<void> {
    await apiClient.post(`/expedientes/${encodeURIComponent(iue)}/tags/${tagId}`);
}

/** Desasigna una etiqueta de un expediente seguido. */
export async function removeTagFromExpediente(iue: string, tagId: string): Promise<void> {
    await apiClient.delete(`/expedientes/${encodeURIComponent(iue)}/tags/${tagId}`);
}
