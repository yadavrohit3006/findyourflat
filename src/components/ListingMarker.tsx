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
  const isReserved  = listing.status === 'RESERVED';

  const pillBg  = isSelected ? '#0284c7' : isAvailable ? '#ffffff' : isReserved ? '#fbbf24' : '#d1d5db';
  const tailBg  = pillBg;
  const textCls = isSelected ? 'text-white' : isAvailable ? 'text-gray-900' : isReserved ? 'text-amber-900' : 'text-gray-500';

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
      {/* drop-shadow follows the full pin shape (pill + tail) */}
      <button
        type="button"
        className={cn(
          'flex flex-col items-center transition-transform duration-150',
          'hover:scale-110 focus:outline-none',
          isSelected ? 'scale-110 z-20' : 'z-10',
        )}
        style={{
          filter: isSelected
            ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))'
            : 'drop-shadow(0 2px 6px rgba(0,0,0,0.32))',
        }}
        aria-label={`${listing.title} - ${formatRent(listing.rentMonthly)}`}
      >
        {/* Pill body */}
        <div
          className={cn(
            'flex items-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap',
            isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-sky-600' : '',
            textCls,
            !isSelected && isAvailable && 'border border-gray-200',
          )}
          style={{ backgroundColor: pillBg }}
        >
          {formatRent(listing.rentMonthly)}
        </div>

        {/* Tail — sits directly below pill with no gap */}
        <div
          className="-mt-px"
          style={{
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: `10px solid ${tailBg}`,
          }}
        />
      </button>
    </Marker>
  );
}
