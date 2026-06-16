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

    let query = client.from('report_data').select('*').order('date');
    if (scene) query = query.eq('scene', scene);
    if (platform) query = query.eq('platform', platform);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result = (data || []).map((r: Record<string, unknown>) => ({
      date: r.date,
      incomePerThousand: parseFloat(r.income_per_thousand as string || '0'),
      estimatedIncome: parseFloat(r.estimated_income as string || '0'),
      ecpm: parseFloat(r.ecpm as string || '0'),
      requestValuePerThousand: parseFloat(r.request_value_per_thousand as string || '0'),
      requestCount: r.request_count as number,
      returnRate: parseFloat(r.return_rate as string || '0'),
      bidSuccessCount: r.bid_success_count as number,
      bidSuccessRate: parseFloat(r.bid_success_rate as string || '0'),
      impressionCount: r.impression_count as number,
      winShowRate: parseFloat(r.win_show_rate as string || '0'),
      clickCount: r.click_count as number,
      clickRate: parseFloat(r.click_rate as string || '0'),
      cpc: parseFloat(r.cpc as string || '0'),
    }));

    return NextResponse.json({ data: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
