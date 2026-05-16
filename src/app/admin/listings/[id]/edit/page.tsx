'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminListingForm, type ExtractedListing } from '@/components/admin/AdminListingForm';
import type { ListingRow } from '@/lib/supabase';

function rowToExtracted(row: ListingRow): ExtractedListing {
  return {
    title: row.title,
    description: row.description,
    rentMonthly: row.rent_monthly,
    listingType: row.listing_type,
    flatType: row.flat_type,
    furnishingStatus: row.furnishing_status,
    genderPreference: row.gender_preference,
    availableFrom: row.available_from ? row.available_from.split('T')[0] : null,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    address: row.address,
    city: row.city,
    neighborhood: row.neighborhood,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

export default function AdminEditListingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/listings')
      .then((r) => r.json())
      .then((data) => {
        const found = (data.listings as ListingRow[])?.find((l) => l.id === id);
        if (!found) { setError('Listing not found.'); return; }
        setListing(found);
      })
      .catch(() => setError('Failed to load listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>;
  }

  if (error || !listing) {
    return <div className="text-red-600 text-sm py-10 text-center">{error || 'Listing not found.'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/admin/listings')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Listing</h1>
      </div>
      <AdminListingForm defaultData={rowToExtracted(listing)} listingId={id} />
    </div>
  );
}
