import type {
  IExpediente,
  IExpedientesQuery,
  IPaginatedExpedientes,
} from "@app-types/expediente.types";
import { apiClient } from "./client";

// ─── Expedientes API ──────────────────────────────────────────────────────────

/**
 * Normalizes an IUE for use in URL path segments.
 * Fastify does not correctly decode %2F (encoded slash) in path parameters,
 * so slashes are converted to colons before encoding. The backend's
 * IueFormatter.format() converts colons back to slashes.
 */
function iueToPathParam(iue: string): string {
  return encodeURIComponent(iue.replace(/\//g, ":"));
}

/** Serializa arrays a string comma-separated para query params del backend. */
function toExpedientesParams(
  params: IExpedientesQuery,
): Record<string, string | number | boolean | undefined> {
  const { tagIds, iues, ...rest } = params;
  const out: Record<string, string | number | boolean | undefined> = {
    ...rest,
  };
  if (Array.isArray(tagIds)) {
    out.tagIds = tagIds.join(",");
  }
  if (Array.isArray(iues)) {
    out.iues = iues.join(",");
  }
  return out;
}

/**
 * Fetches a paginated and filtered list of followed expedientes.
 */
export async function getExpedientes(
  params: IExpedientesQuery = {},
): Promise<IPaginatedExpedientes> {
  const { data } = await apiClient.get<IPaginatedExpedientes>("/expedientes", {
    params: toExpedientesParams(params),
  });
  return data;
}

/**
 * Fetches followed expedientes that had movements today
 * (backend timezone: America/Montevideo), with pagination and filters.
 */
export async function getTodayMovementExpedientes(
  params: IExpedientesQuery = {},
): Promise<IPaginatedExpedientes> {
  const { data } = await apiClient.get<IPaginatedExpedientes>(
    "/expedientes/today-movements",
    {
      params: toExpedientesParams(params),
    },
  );
  return data;
}

/**
 * Fetches a single expediente by its IUE, including all movements.
 */
export async function getExpedienteById(iue: string): Promise<IExpediente> {
  const { data } = await apiClient.get<IExpediente>(
    `/expedientes/${iueToPathParam(iue)}`,
  );
  return data;
}

/**
 * Adds an expediente to the user's follow list by IUE.
 */
export async function followExpediente(iue: string): Promise<void> {
  await apiClient.post(`/expedientes/${iueToPathParam(iue)}/follow`);
}

/**
 * Removes an expediente from the user's follow list.
 */
export async function unfollowExpediente(iue: string): Promise<void> {
  await apiClient.delete(`/expedientes/${iueToPathParam(iue)}/follow`);
}

/**
 * Triggers a manual sync for a single expediente.
 */
export async function syncExpediente(iue: string): Promise<void> {
  await apiClient.post("/expedientes/sync", { iue });
}

/**
 * Toggles the pin (favorite) status of a followed expediente.
 */
export async function pinExpediente(
  iue: string,
  isPinned: boolean,
): Promise<void> {
  await apiClient.patch(`/expedientes/${iueToPathParam(iue)}/follow`, {
    isPinned,
  });
}

/**
 * Updates the personal notes for a followed expediente.
 */
export async function updateExpedienteNotes(
  iue: string,
  notes: string | null,
): Promise<void> {
  await apiClient.patch(`/expedientes/${iueToPathParam(iue)}/follow`, {
    notes,
  });
}

/**
 * Fetches the current user's follow data (isPinned, notes) for a single expediente.
 * Returns null if the user is not following it.
 */
export async function getExpedienteFollowData(
  iue: string,
): Promise<{ isPinned: boolean; notes: string | null } | null> {
  const { data } = await apiClient.get<{
    isPinned: boolean;
    notes: string | null;
  } | null>(`/expedientes/${iueToPathParam(iue)}/follow`);
  return data;
}
