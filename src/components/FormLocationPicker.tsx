'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface GeoFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
}

interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

interface FormLocationPickerProps {
  onPick: (loc: PickedLocation) => void;
  error?: string;
}

function extractCity(feature: GeoFeature): string {
  const ctx = feature.context ?? [];
  const place = ctx.find((c) => c.id.startsWith('place.'));
  const locality = ctx.find((c) => c.id.startsWith('locality.'));
  return place?.text ?? locality?.text ?? feature.text ?? '';
}

export function FormLocationPicker({ onPick, error }: FormLocationPickerProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json` +
          `?access_token=${MAPBOX_TOKEN}&types=address,poi,place,locality,neighborhood,district&country=in&limit=6`
        );
        const data = await res.json();
        setSuggestions(data.features ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setPicked(null);
    setOpen(true);
    fetchSuggestions(value);
  }

  function handleSelect(feature: GeoFeature) {
    const loc: PickedLocation = {
      lat: feature.center[1],
      lng: feature.center[0],
      address: feature.place_name,
      city: extractCity(feature),
    };
    setQuery(feature.place_name);
    setSuggestions([]);
    setOpen(false);
    setPicked(loc);
    onPick(loc);
  }

  function handleClear() {
    setQuery('');
    setSuggestions([]);
    setPicked(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    }
    if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Location <span className="text-red-500">*</span>
      </label>

      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-colors ${
          error ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-300'
        }`}
      >
        {loading ? (
          <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        ) : (
          <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (!picked) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search address, locality, or landmark…"
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100 z-50">
          <ul className="py-1">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                >
                  <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="truncate text-sm text-gray-700">{s.place_name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirmed state */}
      {picked && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">
          <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Location pinned: {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
