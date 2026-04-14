'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Map, { type MapRef, NavigationControl, GeolocateControl } from 'react-map-gl';
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

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'searching';

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

  const { listings, total, isLoading } = useListings(bounds, filters);

  // Notify parent of listing count changes
  const prevTotalRef = useRef<number>(-1);
  if (prevTotalRef.current !== total) {
    prevTotalRef.current = total;
    onListingsChange?.(total);
  }

  // Ask for location immediately on mount so the browser prompt fires ASAP
  useEffect(() => {
    if (!navigator.geolocation) return;

    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        if (mapRef.current) {
          // Map already loaded — fly right away
          mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 13, duration: 1200 });
        } else {
          // Map not ready yet — store and fly in onLoad
          pendingCoordsRef.current = coords;
        }
        setLocationStatus('granted');
        setTimeout(() => setLocationStatus('idle'), 3000);
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
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
    // If geolocation resolved before the map was ready, fly now
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

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onMoveEnd={updateBounds}
        onLoad={handleMapLoad}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedListing(null)}
        reuseMaps
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation={false}
          onGeolocate={(e) => {
            mapRef.current?.flyTo({
              center: [e.coords.longitude, e.coords.latitude],
              zoom: 13,
              duration: 1000,
            });
          }}
        />

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

      {/* Location status toasts */}
      {locationStatus === 'requesting' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 shadow-map-card text-sm text-gray-600 border border-gray-100">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            Finding your location…
          </div>
        </div>
      )}

      {locationStatus === 'granted' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2.5 rounded-full bg-green-600 px-4 py-2.5 shadow-map-card text-sm text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Showing listings near you
          </div>
        </div>
      )}

      {/* Persistent location search — always visible, auto-focuses on location denial */}
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
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs text-amber-800 shadow-sm">
            Zoom in to see all listings in this area
          </div>
        </div>
      )}
    </div>
  );
}
