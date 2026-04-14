'use client';

import { Marker } from 'react-map-gl';
import { cn } from '@/lib/utils';

interface ClusterMarkerProps {
  longitude: number;
  latitude: number;
  pointCount: number;
  clusterId: number;
  onClusterClick: (clusterId: number, longitude: number, latitude: number) => void;
}

export function ClusterMarker({
  longitude,
  latitude,
  pointCount,
  clusterId,
  onClusterClick,
}: ClusterMarkerProps) {
  // Scale size from 36px (2 pts) to 64px (200+ pts)
  const size = Math.min(36 + Math.log2(pointCount) * 6, 64);

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClusterClick(clusterId, longitude, latitude);
      }}
    >
      <button
        type="button"
        className={cn(
          'relative flex items-center justify-center rounded-full font-bold text-white shadow-pin',
          'bg-sky-500 ring-4 ring-sky-200/70',
          'transition-transform hover:scale-110 focus:outline-none'
        )}
        style={{ width: size, height: size, fontSize: size > 48 ? '13px' : '11px' }}
        aria-label={`Cluster of ${pointCount} listings`}
      >
        {pointCount > 999 ? '999+' : pointCount}
      </button>
    </Marker>
  );
}
