import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ListingRow } from '@/lib/supabase';
import type { Listing } from '@/types';

/** Transform DB row to the full Listing type */
function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    city: row.city,
    neighborhood: row.neighborhood,
    title: row.title,
    description: row.description,
    rentMonthly: row.rent_monthly,
    roomType: row.room_type as Listing['roomType'],
    genderPreference: row.gender_preference as Listing['genderPreference'],
    status: row.status as Listing['status'],
    availableFrom: row.available_from,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    imageUrls: [],
    sourceUrl: row.source_url,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json(toListing(data as ListingRow));
}
