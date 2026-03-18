import { getVenues, getVenuesFilters } from "@api/venues.api";
import type {
  IVenuesQuery,
  IPaginatedVenues,
  IVenueFilters,
} from "@app-types/venue.types";

export class VenueService {
  static readonly queryKeys = {
    all: ["venues"] as const,
    lists: () => [...VenueService.queryKeys.all, "list"] as const,
    list: (params: IVenuesQuery) =>
      [...VenueService.queryKeys.lists(), params] as const,
    filters: () => [...VenueService.queryKeys.all, "filters"] as const,
  };

  static async getFilters(): Promise<IVenueFilters> {
    return getVenuesFilters();
  }

  static async getAll(params: IVenuesQuery): Promise<IPaginatedVenues> {
    return getVenues(params);
  }
}
