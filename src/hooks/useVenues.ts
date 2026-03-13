import { useQuery } from "@tanstack/react-query";
import { VenueService } from "@services";
import type { IVenuesQuery } from "@app-types/venue.types";

/**
 * Hook for fetching a paginated list of judicial venues.
 */
export function useVenues(params: IVenuesQuery) {
  return useQuery({
    queryKey: VenueService.queryKeys.list(params),
    queryFn: () => VenueService.getAll(params),
  });
}
