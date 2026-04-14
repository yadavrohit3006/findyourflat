'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { MapSkeleton } from '@/components/MapSkeleton';
import { FiltersPanel } from '@/components/FiltersPanel';
import { useFilters } from '@/hooks/useFilters';

// Load MapView only in the browser — Mapbox needs window/WebGL
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function SuccessBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  if (!searchParams.get('success') || dismissed) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-2xl bg-green-600 px-5 py-3 text-white shadow-map-card text-sm font-medium">
      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Listing posted! It will appear on the map shortly.
      <button onClick={() => setDismissed(true)} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function HomePage() {
  const filtersHook = useFilters();
  const [listingCount, setListingCount] = useState(0);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full-screen map */}
      <MapView filters={filtersHook.filters} onListingsChange={setListingCount} />

      {/* Floating navbar */}
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between gap-3 px-4 pt-4 md:px-6 pointer-events-none">
        {/* Logo */}
        <div className="pointer-events-auto flex-shrink-0">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-map-card">
            <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-sm font-bold text-gray-900 hidden sm:inline">FindYourFlat</span>
          </div>
        </div>

        {/* Post listing button — right */}
        <Link
          href="/add-listing"
          className="pointer-events-auto flex-shrink-0 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-map-card hover:bg-sky-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Post a Listing</span>
          <span className="sm:hidden">Post</span>
        </Link>
      </header>

      {/* Filters panel (floating left on desktop, FAB on mobile) */}
      <FiltersPanel
        hook={filtersHook}
        listingCount={listingCount}
        isLoading={false}
      />

      {/* Success banner */}
      <Suspense>
        <SuccessBanner />
      </Suspense>
    </div>
  );
}
