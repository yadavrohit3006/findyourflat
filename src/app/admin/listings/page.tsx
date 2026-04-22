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
  onApprove,
  onReject,
}: {
  listing: ListingRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function approve() {
    setBusy(true);
    try {
      await fetch(`/api/admin/listings/${listing.id}/approve`, { method: 'POST' });
      onApprove(listing.id);
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/listings/${listing.id}/reject`, { method: 'DELETE' });
      onReject(listing.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm ${listing.is_approved ? 'border-gray-200' : 'border-amber-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {!listing.is_approved && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Pending
              </span>
            )}
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

        <div className="flex flex-col gap-2 flex-shrink-0">
          {!listing.is_approved && (
            <button
              onClick={approve}
              disabled={busy}
              className="rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
            >
              Approve
            </button>
          )}
          <button
            onClick={reject}
            disabled={busy}
            className="rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-medium px-3 py-1.5 transition-colors border border-red-200"
          >
            Delete
          </button>
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

  function handleApprove(id: string) {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_approved: true } : l));
  }

  function handleReject(id: string) {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  const pending = listings.filter((l) => !l.is_approved);
  const approved = listings.filter((l) => l.is_approved);

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
        <h1 className="text-xl font-bold text-gray-900">Listings</h1>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add Listing
        </Link>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs">{pending.length}</span>
            Pending Review
          </h2>
          <div className="space-y-3">
            {pending.map((l) => (
              <ListingCard key={l.id} listing={l} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </div>
        </section>
      )}

      {/* Approved */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs">{approved.length}</span>
          Published
        </h2>
        {approved.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No published listings yet.{' '}
            <Link href="/admin/new" className="text-sky-600 hover:underline">Add one →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map((l) => (
              <ListingCard key={l.id} listing={l} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
