import { getSupabase } from '@/lib/supabase';
import type { ListingRow } from '@/lib/supabase';
import { AdminListingsClient } from './AdminListingsClient';

export default async function AdminListingsPage() {
  const { data, error } = await getSupabase()
    .from('listings')
    .select('id, created_at, title, neighborhood, city, rent_monthly, flat_type, furnishing_status, gender_preference, contact_name, contact_phone, contact_email, is_approved, listing_type, status')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600 text-sm py-10 text-center">Failed to load listings. Please refresh.</div>;
  }

  return <AdminListingsClient initialListings={data as ListingRow[]} />;
}
