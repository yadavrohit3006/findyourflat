import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Vercel automatically sends Authorization: Bearer <CRON_SECRET> for cron requests.
// The same secret must be set in Vercel project env vars as CRON_SECRET.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Deactivate listings where available_from is more than 60 days ago
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffISO = cutoff.toISOString();

  const { data, error } = await getSupabase()
    .from('listings')
    .update({ is_approved: false })
    .eq('is_approved', true)
    .lt('available_from', cutoffISO)
    .select('id, title, available_from');

  if (error) {
    console.error('[cron deactivate-expired]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = data?.length ?? 0;
  console.log(`[cron deactivate-expired] deactivated ${count} listing(s)`);

  return NextResponse.json({ deactivated: count, listings: data });
}
