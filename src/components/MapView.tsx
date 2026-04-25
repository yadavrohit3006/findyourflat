'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Map, { type MapRef, NavigationControl } from 'react-map-gl';
import useSupercluster from 'use-supercluster';
import 'mapbox-gl/dist/mapbox-gl.css';

import { ListingMarker } from './ListingMarker';
import { ClusterMarker } from './ClusterMarker';
import { ListingPopup } from './ListingPopup';
import { LocationSearch } from './LocationSearch';
import { useListings } from '@/hooks/useListings';
import type { ListingFilters, ListingMapPoint, MapBounds } from '@/types';
import type { ListingGeoJSONFeature } from '@/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Fallback: center of India
const DEFAULT_VIEW = { longitude: 78.9629, latitude: 20.5937, zoom: 5 };

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'blocked';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface MapViewProps {
  filters: ListingFilters;
  onListingsChange?: (count: number) => void;
}

export default function MapView({ filters, onListingsChange }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingMapPoint | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');

  // Store resolved coords so we can fly once the map is ready
  const pendingCoordsRef = useRef<{ lng: number; lat: number } | null>(null);
  // Track whether the user has already seen a denial (first deny → 'denied', subsequent → 'blocked')
  const everDeniedRef = useRef(false);

  const { listings, total, isLoading } = useListings(bounds, filters);

  // Notify parent of listing count changes
  const prevTotalRef = useRef<number>(-1);
  if (prevTotalRef.current !== total) {
    prevTotalRef.current = total;
    onListingsChange?.(total);
  }

  // Reusable function — called on mount AND when user clicks the location button
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 13, duration: 1200 });
        } else {
          pendingCoordsRef.current = coords;
        }
        everDeniedRef.current = false;
        setLocationStatus('granted');
        setTimeout(() => setLocationStatus('idle'), 3000);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          if (everDeniedRef.current) {
            // User already denied once and clicked retry — explain how to unblock
            setLocationStatus('blocked');
          } else {
            // First denial — show search bar auto-focused
            everDeniedRef.current = true;
            setLocationStatus('denied');
          }
        } else {
          setLocationStatus('denied');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Ask for location on mount
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    setBounds({
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
    });
  }, []);

  const handleMapLoad = useCallback(() => {
    updateBounds();
    if (pendingCoordsRef.current) {
      const { lng, lat } = pendingCoordsRef.current;
      pendingCoordsRef.current = null;
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 13, duration: 1200 });
    }
  }, [updateBounds]);

  // GeoJSON points for supercluster
  const points: ListingGeoJSONFeature[] = listings.map((l) => ({
    type: 'Feature',
    properties: { ...l, cluster: false },
    geometry: { type: 'Point', coordinates: [l.longitude, l.latitude] },
  }));

  const mapBoundsArray = mapRef.current
    ? (mapRef.current.getMap().getBounds()?.toArray().flat() as
        | [number, number, number, number]
        | undefined)
    : undefined;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: mapBoundsArray,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 16 },
  });

  const handleClusterClick = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      const expansionZoom = Math.min(
        supercluster?.getClusterExpansionZoom(clusterId) ?? 20,
        20
      );
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: expansionZoom, duration: 600 });
    },
    [supercluster]
  );

  const handleMarkerClick = useCallback((listing: ListingMapPoint) => {
    setSelectedListing(listing);
    mapRef.current?.flyTo({
      center: [listing.longitude, listing.latitude],
      duration: 400,
      offset: [0, 60],
    });
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="rounded-2xl bg-white p-6 shadow-map-card text-center max-w-sm">
          <p className="text-sm font-semibold text-red-600 mb-1">Map unavailable</p>
          <p className="text-xs text-gray-500">
            <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> is not set.
            Add it to Vercel environment variables and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onMoveEnd={updateBounds}
        onLoad={handleMapLoad}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedListing(null)}
        onError={(e) => console.error('[Mapbox error]', e.error)}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {clusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const { cluster: isCluster, cluster_id, point_count } = cluster.properties as {
            cluster: boolean;
            cluster_id: number;
            point_count: number;
          };

          if (isCluster) {
            return (
              <ClusterMarker
                key={`cluster-${cluster_id}`}
                longitude={lng}
                latitude={lat}
                pointCount={point_count}
                clusterId={cluster_id}
                onClusterClick={handleClusterClick}
              />
            );
          }

          const props = cluster.properties as ListingMapPoint & { cluster: false };
          return (
            <ListingMarker
              key={props.id}
              listing={props}
              onClick={handleMarkerClick}
              isSelected={selectedListing?.id === props.id}
            />
          );
        })}

        {selectedListing && (
          <ListingPopup
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </Map>

      {/* Custom location button — positioned above NavigationControl (compass hidden, ~62px tall) */}
      <div className="absolute bottom-24 right-2.5 z-10">
        <div className="relative">
          <button
            onClick={requestLocation}
            title="Use my location"
            className="flex h-[29px] w-[29px] items-center justify-center rounded-sm bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            {locationStatus === 'requesting' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            ) : locationStatus === 'granted' ? (
              <svg className="h-4 w-4 text-sky-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            ) : locationStatus === 'denied' || locationStatus === 'blocked' ? (
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            )}
          </button>

          {/* "Blocked" popover — appears to the LEFT of the button, not at top-center */}
          {locationStatus === 'blocked' && (
            <div className="absolute bottom-0 right-full mr-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 p-3 z-20">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">Location blocked</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                    Go to browser settings → Site permissions → Location → Allow.
                  </p>
                </div>
                <button
                  onClick={() => setLocationStatus('denied')}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location status toasts — shown below search bar to avoid overlapping it */}
      {locationStatus === 'requesting' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 md:top-16">
          <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 shadow-map-card text-sm text-gray-600 border border-gray-100">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            Finding your location…
          </div>
        </div>
      )}

      {locationStatus === 'granted' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 md:top-16">
          <div className="flex items-center gap-2.5 rounded-full bg-green-600 px-4 py-2.5 shadow-map-card text-sm text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Showing listings near you
          </div>
        </div>
      )}

      {/* Location search */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[90vw] max-w-sm md:top-4 pointer-events-auto">
        <LocationSearch
          autoFocus={locationStatus === 'denied'}
          onSelect={(lng, lat) => {
            mapRef.current?.flyTo({ center: [lng, lat], zoom: 13, duration: 1000 });
            if (locationStatus === 'denied') setLocationStatus('idle');
          }}
        />
      </div>

      {/* Listings loading indicator */}
      {isLoading && locationStatus === 'idle' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-map-card text-sm text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            Loading listings…
          </div>
        </div>
      )}

      {/* Zoom hint when capped at 500 results */}
      {total >= 500 && !isLoading && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs text-amber-800 shadow-sm">
            Zoom in to see all listings in this area
          </div>
        </div>
      )}
    </div>
  );
}
