import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { createListingSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await getSupabase()
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    .update({
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
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[admin PATCH /api/admin/listings/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
