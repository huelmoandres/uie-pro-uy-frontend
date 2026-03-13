import { useQuery } from "@tanstack/react-query";
import { VenueService } from "@services";

/**
 * Hook for fetching venue filter options (departments, cities, subjects).
 */
export function useVenuesFilters() {
  return useQuery({
    queryKey: VenueService.queryKeys.filters(),
    queryFn: () => VenueService.getFilters(),
  });
}
