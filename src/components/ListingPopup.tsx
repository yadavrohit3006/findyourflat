'use client';

import { useState } from 'react';
import { Popup } from 'react-map-gl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useListing } from '@/hooks/useListings';
import {
  formatRentFull,
  listingTypeLabel,
  listingTypeColor,
  flatTypeLabel,
  flatTypeColor,
  statusLabel,
  statusColor,
  formatDate,
} from '@/lib/utils';
import type { ListingMapPoint } from '@/types';

interface ListingPopupProps {
  listing: ListingMapPoint;
  onClose: () => void;
}

export function ListingPopup({ listing, onClose }: ListingPopupProps) {
  const [showContact, setShowContact] = useState(false);
  const { listing: fullListing, isLoading } = useListing(showContact ? listing.id : null);

  return (
    <Popup
      longitude={listing.longitude}
      latitude={listing.latitude}
      anchor="bottom"
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      maxWidth="320px"
      offset={16}
      className="listing-popup"
    >
      <div className="relative w-[280px] rounded-2xl bg-white shadow-map-card">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4">
          {/* Badges */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge className={listingTypeColor(listing.listingType)}>
              {listingTypeLabel(listing.listingType)}
            </Badge>
            <Badge className={flatTypeColor(listing.flatType)}>
              {flatTypeLabel(listing.flatType)}
            </Badge>
            <Badge className="bg-teal-100 text-teal-800">
              {{ UNFURNISHED: 'Unfurnished', SEMI_FURNISHED: 'Semi-Furnished', FULLY_FURNISHED: 'Fully Furnished' }[listing.furnishingStatus]}
            </Badge>
            <Badge className={statusColor(listing.status)}>
              {statusLabel(listing.status)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="mb-1 pr-6 text-sm font-semibold leading-snug text-gray-900">
            {listing.title}
          </h3>

          {/* Location */}
          <p className="mb-3 flex items-center gap-1 text-xs text-gray-500">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
          </p>

          {/* Rent */}
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-xl font-bold text-sky-600">
              {formatRentFull(listing.rentMonthly)}
            </span>
          </div>

          {/* Contact reveal */}
          {!showContact ? (
            <Button
              className="w-full"
              size="sm"
              onClick={() => setShowContact(true)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Show Contact
            </Button>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
          ) : fullListing ? (
            <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
              {fullListing.availableFrom && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Available from:</span>{' '}
                  {formatDate(fullListing.availableFrom)}
                </p>
              )}
              {fullListing.contactName && (
                <p className="text-xs text-gray-700 font-medium">{fullListing.contactName}</p>
              )}
              {fullListing.contactPhone && (
                <a
                  href={`tel:${fullListing.contactPhone}`}
                  className="flex items-center gap-1.5 text-xs text-sky-600 hover:underline"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {fullListing.contactPhone}
                </a>
              )}
              {fullListing.contactEmail && (
                <a
                  href={`mailto:${fullListing.contactEmail}`}
                  className="flex items-center gap-1.5 text-xs text-sky-600 hover:underline"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {fullListing.contactEmail}
                </a>
              )}
              {fullListing.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 pt-1 border-t border-gray-200">
                  {fullListing.description}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">No contact info available</p>
          )}
        </div>
      </div>
    </Popup>
  );
}
