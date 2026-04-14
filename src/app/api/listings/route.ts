import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { ListingRow } from '@/lib/supabase';
import { createListingSchema } from '@/lib/validations';
import type { ListingMapPoint } from '@/types';

const MAX_RESULTS = 500;

/** Transform a DB row to the ListingMapPoint shape used by the map */
function toMapPoint(row: ListingRow): ListingMapPoint {
  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    rentMonthly: row.rent_monthly,
    roomType: row.room_type as ListingMapPoint['roomType'],
    status: row.status as ListingMapPoint['status'],
    title: row.title,
    neighborhood: row.neighborhood,
    city: row.city,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const boundsParam = searchParams.get('bounds');
  if (!boundsParam) {
    return NextResponse.json({ error: 'bounds query param is required' }, { status: 400 });
  }

  const parts = boundsParam.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return NextResponse.json({ error: 'bounds must be: west,south,east,north' }, { status: 400 });
  }

  const [west, south, east, north] = parts;
  const rentMin = Number(searchParams.get('rentMin') ?? 0);
  const rentMax = Number(searchParams.get('rentMax') ?? 500000);
  const roomTypesParam = searchParams.get('roomTypes');
  const statusParam = searchParams.get('status');
  const genderParam = searchParams.get('genderPreference');
  const roomTypes = roomTypesParam ? roomTypesParam.split(',') : [];

  let query = getSupabase()
    .from('listings')
    .select('id, latitude, longitude, rent_monthly, room_type, status, title, neighborhood, city', {
      count: 'exact',
    })
    .gte('latitude', south)
    .lte('latitude', north)
    .gte('longitude', west)
    .lte('longitude', east)
    .gte('rent_monthly', rentMin)
    .lte('rent_monthly', rentMax)
    .limit(MAX_RESULTS)
    .order('created_at', { ascending: false });

  if (roomTypes.length > 0) query = query.in('room_type', roomTypes);
  if (statusParam) query = query.eq('status', statusParam);
  if (genderParam) query = query.eq('gender_preference', genderParam);

  const { data, count, error } = await query;

  if (error) {
    console.error('[GET /api/listings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const listings = (data as ListingRow[]).map(toMapPoint);
  return NextResponse.json({ listings, total: count ?? listings.length });
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
      room_type: d.roomType,
      gender_preference: d.genderPreference,
      available_from: d.availableFrom ?? null,
      contact_name: d.contactName ?? null,
      contact_email: d.contactEmail || null,
      contact_phone: d.contactPhone ?? null,
      source_url: d.googleMapsUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/listings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
