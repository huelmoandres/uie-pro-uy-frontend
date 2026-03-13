import type {
  IVenuesQuery,
  IPaginatedVenues,
  IVenueFilters,
} from "@app-types/venue.types";
import { apiClient } from "./client";

/**
 * Fetches filter options for venues (departments with cities, subjects).
 */
export async function getVenuesFilters(): Promise<IVenueFilters> {
  const { data } = await apiClient.get<IVenueFilters>("/sedes/filters");
  return data;
}

/**
 * Fetches a paginated and filtered list of judicial venues.
 */
export async function getVenues(
  params: IVenuesQuery = {},
): Promise<IPaginatedVenues> {
  const { data } = await apiClient.get<IPaginatedVenues>("/sedes", {
    params,
  });
  return data;
}
