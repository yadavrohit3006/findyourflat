import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — not initialized at module load so the build doesn't crash
// when env vars are absent during Vercel's static analysis phase.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    }
    _client = createClient(url, key);
  }
  return _client;
}

/** Row shape as stored in Supabase (snake_case) */
export interface ListingRow {
  id: string;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  neighborhood: string | null;
  title: string;
  description: string | null;
  rent_monthly: number;
  room_type: string;
  listing_type: string;
  flat_type: string;
  furnishing_status: string;
  gender_preference: string;
  status: string;
  available_from: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source_url: string | null;
  is_approved: boolean;
}
