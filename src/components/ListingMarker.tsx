'use client';

import { Marker } from 'react-map-gl';
import { formatRent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ListingMapPoint } from '@/types';

interface ListingMarkerProps {
  listing: ListingMapPoint;
  onClick: (listing: ListingMapPoint) => void;
  isSelected: boolean;
}

export function ListingMarker({ listing, onClick, isSelected }: ListingMarkerProps) {
  return (
    <Marker
      longitude={listing.longitude}
      latitude={listing.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(listing);
      }}
    >
      <button
        type="button"
        className={cn(
          'relative flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-pin transition-all duration-150',
          'hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1',
          isSelected
            ? 'z-20 scale-110 bg-sky-600 text-white shadow-lg ring-2 ring-white'
            : listing.status === 'AVAILABLE'
            ? 'z-10 bg-white text-gray-900 hover:bg-sky-600 hover:text-white'
            : listing.status === 'RESERVED'
            ? 'z-10 bg-amber-100 text-amber-900'
            : 'z-10 bg-gray-200 text-gray-500 line-through',
        )}
        aria-label={`${listing.title} - ${formatRent(listing.rentMonthly)}`}
      >
        {formatRent(listing.rentMonthly)}
        {/* Tail of the pin */}
        <span
          className={cn(
            'absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent',
            isSelected
              ? 'border-t-sky-600'
              : listing.status === 'AVAILABLE'
              ? 'border-t-white'
              : listing.status === 'RESERVED'
              ? 'border-t-amber-100'
              : 'border-t-gray-200',
          )}
        />
      </button>
    </Marker>
  );
}
