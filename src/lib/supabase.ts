import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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
  gender_preference: string;
  status: string;
  available_from: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source_url: string | null;
}
