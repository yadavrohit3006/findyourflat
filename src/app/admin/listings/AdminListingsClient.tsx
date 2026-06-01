'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ListingRow } from '@/lib/supabase';

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRent(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
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
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">{formatDate(listing.created_at)}</span>
          </div>
          <h3 className="mt-1 font-semibold text-gray-900 text-sm leading-snug truncate">{listing.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{formatRent(listing.rent_monthly)}/mo</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{listing.flat_type}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 capitalize">{listing.furnishing_status.replace('_', ' ').toLowerCase()}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{listing.gender_preference.replace('_', ' ')}</span>
            {listing.source === 'ADMIN' ? (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">Admin</span>
            ) : (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">User</span>
            )}
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
          <Link
            href={`/admin/listings/${listing.id}/edit`}
            className="rounded-xl text-xs font-medium px-3 py-1.5 transition-colors bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200"
          >
            Edit
          </Link>
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

export function AdminListingsClient({ initialListings }: { initialListings: ListingRow[] }) {
  const [listings, setListings] = useState<ListingRow[]>(initialListings);
  const [tab, setTab] = useState<'active' | 'inactive'>('active');

  function handleActivate(id: string) {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_approved: true } : l));
  }

  function handleDeactivate(id: string) {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_approved: false } : l));
  }

  const active = listings.filter((l) => l.is_approved);
  const inactive = listings.filter((l) => !l.is_approved);
  const shown = tab === 'active' ? active : inactive;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Listings</h1>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-1 w-fit">
        <button
          onClick={() => setTab('active')}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'active' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
          <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
            tab === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {active.length}
          </span>
        </button>
        <button
          onClick={() => setTab('inactive')}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'inactive' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Inactive
          <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
            tab === 'inactive' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {inactive.length}
          </span>
        </button>
      </div>

      <section>
        {shown.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {tab === 'active' ? (
              <>No active listings. <Link href="/admin/new" className="text-sky-600 hover:underline">Add one →</Link></>
            ) : (
              'No inactive listings.'
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((l) => (
              <ListingCard key={l.id} listing={l} onActivate={handleActivate} onDeactivate={handleDeactivate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
