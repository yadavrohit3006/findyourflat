'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn, listingTypeLabel, flatTypeLabel } from '@/lib/utils';
import type { ListingFilters, ListingType, FlatType, FurnishingStatus } from '@/types';
import type { FiltersHook } from '@/hooks/useFilters';

const LISTING_TYPES: ListingType[] = ['NEW_LISTING', 'REPLACEMENT'];
const FLAT_TYPES: FlatType[] = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK'];
const FURNISHING_STATUSES: { value: FurnishingStatus; label: string }[] = [
  { value: 'UNFURNISHED', label: 'Unfurnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
];

const RENT_PRESETS = [
  { label: 'Any', min: 0, max: 100000 },
  { label: 'Under ₹10k', min: 0, max: 10000 },
  { label: '₹10k–20k', min: 10000, max: 20000 },
  { label: '₹20k–40k', min: 20000, max: 40000 },
  { label: '₹40k+', min: 40000, max: 100000 },
];

interface FiltersPanelProps {
  hook: FiltersHook;
  listingCount: number;
  isLoading: boolean;
}

export function FiltersPanel({ hook, listingCount, isLoading }: FiltersPanelProps) {
  const {
    filters,
    updateFilters,
    resetFilters,
    toggleListingType,
    toggleFlatType,
    toggleFurnishingStatus,
    isActive,
  } = hook;
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeRentPreset = RENT_PRESETS.find(
    (p) => p.min === filters.rentMin && p.max === filters.rentMax
  );

  const activeFilterCount =
    (filters.listingTypes.length > 0 ? 1 : 0) +
    (filters.flatTypes.length > 0 ? 1 : 0) +
    (filters.furnishingStatuses.length > 0 ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.rentMin > 0 || filters.rentMax < 100000 ? 1 : 0);

  const filterContent = (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isLoading ? (
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border border-sky-500 border-t-transparent" />
                Loading...
              </span>
            ) : (
              `${listingCount} listing${listingCount !== 1 ? 's' : ''} in view`
            )}
          </p>
        </div>
        {isActive && (
          <button
            onClick={resetFilters}
            className="text-xs text-sky-600 hover:text-sky-800 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Rent Range */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Rent / month</p>
        <div className="flex flex-wrap gap-1.5">
          {RENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => updateFilters({ rentMin: preset.min, rentMax: preset.max })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                activeRentPreset?.label === preset.label
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:text-sky-700'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Listing type</p>
        <div className="flex flex-wrap gap-1.5">
          {LISTING_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleListingType(type)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.listingTypes.includes(type)
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:text-sky-700'
              )}
            >
              {listingTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Flat Type */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Flat type</p>
        <div className="flex flex-wrap gap-1.5">
          {FLAT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleFlatType(type)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.flatTypes.includes(type)
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:text-sky-700'
              )}
            >
              {flatTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Furnishing Status */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Furnishing</p>
        <div className="flex flex-wrap gap-1.5">
          {FURNISHING_STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleFurnishingStatus(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.furnishingStatuses.includes(value)
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:text-sky-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Availability</p>
        <div className="flex gap-1.5">
          {(['ALL', 'AVAILABLE', 'RESERVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateFilters({ status })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.status === status
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:text-sky-700'
              )}
            >
              {status === 'ALL' ? 'All' : status === 'AVAILABLE' ? 'Available' : 'Reserved'}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Preference */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Gender preference</p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'ALL', label: 'Any' },
              { value: 'FEMALE_ONLY', label: 'Female only' },
              { value: 'MALE_ONLY', label: 'Male only' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilters({ genderPreference: opt.value })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.genderPreference === opt.value
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:text-sky-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: floating card */}
      <div className="absolute left-4 top-4 z-10 hidden w-72 rounded-2xl bg-white p-4 shadow-map-card md:block overflow-y-auto max-h-[calc(100vh-2rem)]">
        {filterContent}
      </div>

      {/* Mobile: fixed FAB — bottom-LEFT so it doesn't clash with map controls on bottom-right */}
      <div className="fixed bottom-6 left-4 z-30 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors',
            isActive
              ? 'bg-sky-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filters
          {isActive && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-sky-600">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: bottom sheet — fixed so it overlays the full viewport */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 pb-10 shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="text-gray-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {filterContent}
            <Button className="mt-5 w-full" onClick={() => setMobileOpen(false)}>
              Show {listingCount} listing{listingCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
