'use client';

import { useCallback, useState } from 'react';
import type { ListingFilters, RoomType, AvailabilityStatus, GenderPreference } from '@/types';

export const DEFAULT_FILTERS: ListingFilters = {
  rentMin: 0,
  rentMax: 100000,
  roomTypes: [],
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

  const toggleRoomType = useCallback((type: RoomType) => {
    setFilters((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(type)
        ? prev.roomTypes.filter((t) => t !== type)
        : [...prev.roomTypes, type],
    }));
  }, []);

  const isActive =
    filters.rentMin !== DEFAULT_FILTERS.rentMin ||
    filters.rentMax !== DEFAULT_FILTERS.rentMax ||
    filters.roomTypes.length > 0 ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.genderPreference !== DEFAULT_FILTERS.genderPreference;

  return { filters, updateFilters, resetFilters, toggleRoomType, isActive };
}

export type FiltersHook = ReturnType<typeof useFilters>;
