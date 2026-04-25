'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface LocationSearchProps {
  onSelect: (lng: number, lat: number, label: string) => void;
  autoFocus?: boolean;
}

const POPULAR_CITIES = [
  { label: 'Bangalore', lng: 77.5946, lat: 12.9716 },
  { label: 'Mumbai',    lng: 72.8777, lat: 19.0760 },
  { label: 'Delhi',     lng: 77.2090, lat: 28.6139 },
  { label: 'Gurugram',  lng: 77.0266, lat: 28.4595 },
  { label: 'Pune',      lng: 73.8567, lat: 18.5204 },
  { label: 'Hyderabad', lng: 78.4867, lat: 17.3850 },
  { label: 'Chennai',   lng: 80.2707, lat: 13.0827 },
];

export function LocationSearch({ onSelect, autoFocus = false }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      setOpen(true);
    }
  }, [autoFocus]);

  // Close dropdown when clicking outside
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
          `?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood,district&country=in&limit=6`
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
    setOpen(true);
    fetchSuggestions(value);
  }

  function handleSelect(lng: number, lat: number, label: string) {
    setQuery(label.split(',')[0]); // show just the locality name, not full address
    setSuggestions([]);
    setOpen(false);
    onSelect(lng, lat, label);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      const first = suggestions[0];
      handleSelect(first.center[0], first.center[1], first.place_name);
    }
    if (e.key === 'Escape') setOpen(false);
  }

  const showPopular = open && !query.trim();
  const showSuggestions = open && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Input */}
      <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-map-card border border-gray-100">
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
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search locality, city…"
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {(showSuggestions || showPopular) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 overflow-hidden rounded-2xl bg-white shadow-map-card border border-gray-100 z-50">

          {/* Autocomplete results */}
          {showSuggestions && (
            <ul className="py-1">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                    onClick={() => handleSelect(s.center[0], s.center[1], s.place_name)}
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
          )}

          {/* Popular cities (shown when input is empty) */}
          {showPopular && (
            <div className="p-3">
              <p className="mb-2 px-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Popular cities</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(city.lng, city.lat, city.label)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
