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
  const isAvailable = listing.status === 'AVAILABLE';
  const isReserved = listing.status === 'RESERVED';

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
          'relative flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-pin transition-all duration-150',
          'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1',
          isSelected
            ? 'z-20 scale-110 bg-sky-600 text-white ring-2 ring-white ring-offset-1'
            : isAvailable
            ? 'z-10 bg-white text-gray-900 border border-gray-300 hover:bg-sky-600 hover:text-white hover:border-sky-600'
            : isReserved
            ? 'z-10 bg-amber-400 text-amber-900 border border-amber-500'
            : 'z-10 bg-gray-300 text-gray-500 border border-gray-400 line-through',
        )}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        aria-label={`${listing.title} - ${formatRent(listing.rentMonthly)}`}
      >
        {formatRent(listing.rentMonthly)}

        {/* Tail */}
        <span
          className={cn(
            'absolute -bottom-2 left-1/2 -translate-x-1/2',
            'border-l-[6px] border-r-[6px] border-t-[8px]',
            'border-l-transparent border-r-transparent',
            isSelected
              ? 'border-t-sky-600'
              : isAvailable
              ? 'border-t-gray-300'
              : isReserved
              ? 'border-t-amber-500'
              : 'border-t-gray-400',
          )}
        />
        {/* Inner tail — fills the colour */}
        <span
          className={cn(
            'absolute -bottom-[6px] left-1/2 -translate-x-1/2',
            'border-l-[5px] border-r-[5px] border-t-[7px]',
            'border-l-transparent border-r-transparent',
            isSelected
              ? 'border-t-sky-600'
              : isAvailable
              ? 'border-t-white'
              : isReserved
              ? 'border-t-amber-400'
              : 'border-t-gray-300',
          )}
        />
      </button>
    </Marker>
  );
}
