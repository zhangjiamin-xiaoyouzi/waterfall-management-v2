import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const scene = searchParams.get('scene');
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = client.from('ab_report_data').select('*').order('date');
    if (scene) query = query.eq('scene', scene);
    if (platform) query = query.eq('platform', platform);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result = (data || []).map((r: Record<string, unknown>) => ({
      date: r.date,
      groupA: r.group_a as Record<string, unknown>,
      groupB: r.group_b as Record<string, unknown>,
    }));

    return NextResponse.json({ data: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
