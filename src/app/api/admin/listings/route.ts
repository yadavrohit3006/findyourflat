import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { ListingRow } from '@/lib/supabase';
import { createListingSchema } from '@/lib/validations';

export async function GET() {
  const { data, error } = await getSupabase()
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin GET /api/admin/listings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data as ListingRow[] });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string[]> = {};
    parsed.error.errors.forEach((e) => {
      const key = e.path.join('.');
      if (!details[key]) details[key] = [];
      details[key].push(e.message);
    });
    return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
  }

  const d = parsed.data;

  const { data, error } = await getSupabase()
    .from('listings')
    .insert({
      latitude: d.latitude,
      longitude: d.longitude,
      address: d.address,
      city: d.city,
      neighborhood: d.neighborhood ?? null,
      title: d.title,
      description: d.description ?? null,
      rent_monthly: d.rentMonthly,
      listing_type: d.listingType,
      flat_type: d.flatType,
      furnishing_status: d.furnishingStatus,
      gender_preference: d.genderPreference,
      available_from: d.availableFrom ?? null,
      contact_name: d.contactName ?? null,
      contact_email: d.contactEmail || null,
      contact_phone: d.contactPhone ?? null,
      source_url: null,
      is_approved: true,
    })
    .select()
    .single();

  if (error) {
    console.error('[admin POST /api/admin/listings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
