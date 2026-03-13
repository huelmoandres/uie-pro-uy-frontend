/**
 * Types for judicial venues (sedes judiciales).
 * Mirrors backend DTOs.
 */

export interface IVenue {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  cityName: string;
  departmentName: string;
  subjectName: string;
  lat: number | null;
  lng: number | null;
  distanceKm?: number;
  metadata: Record<string, unknown> | null;
}

export interface IVenuesQuery {
  page?: number;
  limit?: number;
  departmentId?: string;
  cityId?: string;
  subjectId?: string;
  search?: string;
  userLat?: number;
  userLng?: number;
}

export interface PaginatedVenuesMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface IPaginatedVenues {
  data: IVenue[];
  meta: PaginatedVenuesMeta;
}

export interface IVenueFilters {
  departments: Array<{
    id: string;
    name: string;
    cities: Array<{ id: string; name: string }>;
  }>;
  subjects: Array<{ id: string; name: string }>;
}
