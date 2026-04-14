'use client';

import { useCallback, useState } from 'react';
import type { ListingFilters, ListingType, FlatType, AvailabilityStatus, GenderPreference } from '@/types';

export const DEFAULT_FILTERS: ListingFilters = {
  rentMin: 0,
  rentMax: 100000,
  listingTypes: [],
  flatTypes: [],
  status: 'AVAILABLE',
  genderPreference: 'ALL',
};

export function useFilters() {
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);

  const updateFilters = useCallback((partial: Partial<ListingFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toggleListingType = useCallback((type: ListingType) => {
    setFilters((prev) => ({
      ...prev,
      listingTypes: prev.listingTypes.includes(type)
        ? prev.listingTypes.filter((t) => t !== type)
        : [...prev.listingTypes, type],
    }));
  }, []);

  const toggleFlatType = useCallback((type: FlatType) => {
    setFilters((prev) => ({
      ...prev,
      flatTypes: prev.flatTypes.includes(type)
        ? prev.flatTypes.filter((t) => t !== type)
        : [...prev.flatTypes, type],
    }));
  }, []);

  const isActive =
    filters.rentMin !== DEFAULT_FILTERS.rentMin ||
    filters.rentMax !== DEFAULT_FILTERS.rentMax ||
    filters.listingTypes.length > 0 ||
    filters.flatTypes.length > 0 ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.genderPreference !== DEFAULT_FILTERS.genderPreference;

  return { filters, updateFilters, resetFilters, toggleListingType, toggleFlatType, isActive };
}

export type FiltersHook = ReturnType<typeof useFilters>;
