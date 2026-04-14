'use client';

import useSWR from 'swr';
import type { ListingFilters, MapBounds, ApiListingsResponse, Listing } from '@/types';
import { useDebounce } from './useDebounce';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json() as Promise<ApiListingsResponse>;
  });

const listingFetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Listing not found');
    return res.json() as Promise<Listing>;
  });

export function useListings(bounds: MapBounds | null, filters: ListingFilters) {
  const debouncedBounds = useDebounce(bounds, 300);
  const debouncedFilters = useDebounce(filters, 300);

  const key = buildKey(debouncedBounds, debouncedFilters);

  const { data, isLoading, error } = useSWR<ApiListingsResponse>(key, fetcher, {
    keepPreviousData: true,  // prevent flicker while panning
    revalidateOnFocus: false,
  });

  return {
    listings: data?.listings ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}

export function useListing(id: string | null) {
  const { data, isLoading, error } = useSWR<Listing>(
    id ? `/api/listings/${id}` : null,
    listingFetcher,
    { revalidateOnFocus: false }
  );

  return { listing: data ?? null, isLoading, error };
}

function buildKey(bounds: MapBounds | null, filters: ListingFilters): string | null {
  if (!bounds) return null;

  const params = new URLSearchParams({
    bounds: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    rentMin: String(filters.rentMin),
    rentMax: String(filters.rentMax),
  });

  if (filters.listingTypes.length > 0) {
    params.set('listingTypes', filters.listingTypes.join(','));
  }
  if (filters.flatTypes.length > 0) {
    params.set('flatTypes', filters.flatTypes.join(','));
  }
  if (filters.status !== 'ALL') {
    params.set('status', filters.status);
  }
  if (filters.genderPreference !== 'ALL') {
    params.set('genderPreference', filters.genderPreference);
  }

  return `/api/listings?${params.toString()}`;
}
