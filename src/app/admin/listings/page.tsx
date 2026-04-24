'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { ListingRow } from '@/lib/supabase';

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRent(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function flatLabel(s: string) {
  return s; // e.g. "2BHK"
}

function ListingCard({
  listing,
  onActivate,
  onDeactivate,
}: {
  listing: ListingRow;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [toggleError, setToggleError] = useState('');

  async function toggle() {
    setBusy(true);
    setToggleError('');
    const wasApproved = listing.is_approved;
    try {
      const endpoint = wasApproved ? 'reject' : 'approve';
      const res = await fetch(`/api/admin/listings/${listing.id}/${endpoint}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToggleError(data.error ?? 'Failed to update. Try again.');
        return;
      }
      wasApproved ? onDeactivate(listing.id) : onActivate(listing.id);
    } catch {
      setToggleError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm ${listing.is_approved ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              listing.is_approved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {listing.is_approved ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-400">{formatDate(listing.created_at)}</span>
          </div>
          <h3 className="mt-1 font-semibold text-gray-900 text-sm leading-snug truncate">{listing.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{formatRent(listing.rent_monthly)}/mo</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{flatLabel(listing.flat_type)}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 capitalize">{listing.furnishing_status.replace('_', ' ').toLowerCase()}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{listing.gender_preference.replace('_', ' ')}</span>
          </div>
          {(listing.contact_phone || listing.contact_email || listing.contact_name) && (
            <p className="mt-2 text-xs text-gray-500">
              {listing.contact_name && <span className="font-medium">{listing.contact_name} · </span>}
              {listing.contact_phone && <span>{listing.contact_phone}</span>}
              {listing.contact_phone && listing.contact_email && <span> · </span>}
              {listing.contact_email && <span>{listing.contact_email}</span>}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <button
            onClick={toggle}
            disabled={busy}
            className={`rounded-xl text-xs font-medium px-3 py-1.5 transition-colors disabled:opacity-50 ${
              listing.is_approved
                ? 'bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 border border-gray-200 hover:border-red-200'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {busy ? '…' : listing.is_approved ? 'Set Inactive' : 'Set Active'}
          </button>
          {toggleError && <p className="text-xs text-red-500 max-w-[120px] text-right">{toggleError}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/listings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setError('Failed to load listings. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleActivate(id: string) {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_approved: true } : l));
  }

  function handleDeactivate(id: string) {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_approved: false } : l));
  }

  const active = listings.filter((l) => l.is_approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-sm py-10 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Listings</h1>
          <p className="text-xs text-gray-400 mt-0.5">{active} active · {listings.length} total</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add Listing
        </Link>
      </div>

      <section>
        {listings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No listings yet.{' '}
            <Link href="/admin/new" className="text-sky-600 hover:underline">Add one →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} onActivate={handleActivate} onDeactivate={handleDeactivate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
