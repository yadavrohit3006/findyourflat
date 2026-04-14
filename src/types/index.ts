export type ListingType = 'NEW_LISTING' | 'REPLACEMENT';
export type FlatType = '1RK' | '1BHK' | '2BHK' | '3BHK';
export type GenderPreference = 'ANY' | 'MALE_ONLY' | 'FEMALE_ONLY' | 'NON_BINARY_FRIENDLY';
export type AvailabilityStatus = 'AVAILABLE' | 'RESERVED' | 'TAKEN';

/** Full listing shape — returned from GET /api/listings/:id */
export interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  neighborhood: string | null;
  title: string;
  description: string | null;
  rentMonthly: number;
  listingType: ListingType;
  flatType: FlatType;
  genderPreference: GenderPreference;
  status: AvailabilityStatus;
  availableFrom: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  imageUrls: string[];
  sourceUrl: string | null;
}

/** Lightweight shape used for map markers — returned from GET /api/listings */
export interface ListingMapPoint {
  id: string;
  latitude: number;
  longitude: number;
  rentMonthly: number;
  listingType: ListingType;
  flatType: FlatType;
  status: AvailabilityStatus;
  title: string;
  neighborhood: string | null;
  city: string;
}

/** Active filter state */
export interface ListingFilters {
  rentMin: number;
  rentMax: number;
  listingTypes: ListingType[];
  flatTypes: FlatType[];
  status: AvailabilityStatus | 'ALL';
  genderPreference: GenderPreference | 'ALL';
}

/** Mapbox visible bounds */
export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** Input for creating a listing (form → API) */
export interface CreateListingInput {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  neighborhood?: string;
  title: string;
  description?: string;
  rentMonthly: number;
  listingType: ListingType;
  flatType: FlatType;
  genderPreference: GenderPreference;
  availableFrom?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/** API response from GET /api/listings */
export interface ApiListingsResponse {
  listings: ListingMapPoint[];
  total: number;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

/** GeoJSON feature used with supercluster */
export type ListingGeoJSONFeature = GeoJSON.Feature<
  GeoJSON.Point,
  ListingMapPoint & { cluster: false }
>;
