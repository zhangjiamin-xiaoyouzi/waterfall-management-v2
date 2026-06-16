import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const scene = searchParams.get('scene');
    const platform = searchParams.get('platform');

    let query = client.from('ad_sources').select('*');
    if (groupId) query = query.eq('group_id', groupId);
    if (scene) query = query.eq('scene', scene);
    if (platform) query = query.eq('platform', platform);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result = (data || []).map((s: Record<string, unknown>) => ({
      id: s.id,
      groupId: s.group_id,
      name: s.name,
      icon: s.icon,
      status: s.status,
      pricingType: s.pricing_type,
      price: parseFloat(s.price as string || '0'),
      priceA: s.price_a ? parseFloat(s.price_a as string) : undefined,
      priceB: s.price_b ? parseFloat(s.price_b as string) : undefined,
      estimatedRevenue: parseFloat(s.estimated_revenue as string || '0'),
      ecpm: parseFloat(s.ecpm as string || '0'),
      thousandRequestValue: parseFloat(s.thousand_request_value as string || '0'),
      requests: s.requests as number,
      responses: s.responses as number,
      responseRate: parseFloat(s.response_rate as string || '0'),
      bidWins: s.bid_wins as number,
      bidWinRate: parseFloat(s.bid_win_rate as string || '0'),
      revenuePerThousand: s.revenue_per_thousand ? parseFloat(s.revenue_per_thousand as string) : undefined,
      impressions: s.impressions as number | undefined,
      winImpressionRate: s.win_impression_rate ? parseFloat(s.win_impression_rate as string) : undefined,
      clicks: s.clicks as number | undefined,
      ctr: s.ctr ? parseFloat(s.ctr as string) : undefined,
      cpc: s.cpc ? parseFloat(s.cpc as string) : undefined,
      isFallback: s.is_fallback ?? false,
      lastUpdated: s.last_updated,
      platforms: s.platforms,
      codeId: s.code_id,
      subPositions: s.sub_positions,
      dspSources: s.dsp_sources,
      minVersion: s.min_version,
      maxVersion: s.max_version,
    }));

    return NextResponse.json({ data: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const row = {
      id: body.id,
      group_id: body.groupId,
      name: body.name,
      icon: body.icon ?? null,
      status: body.status || 'enabled',
      pricing_type: body.pricingType,
      price: String(body.price || 0),
      price_a: body.priceA ? String(body.priceA) : null,
      price_b: body.priceB ? String(body.priceB) : null,
      estimated_revenue: String(body.estimatedRevenue || 0),
      ecpm: String(body.ecpm || 0),
      thousand_request_value: String(body.thousandRequestValue || 0),
      requests: body.requests || 0,
      responses: body.responses || 0,
      response_rate: String(body.responseRate || 0),
      bid_wins: body.bidWins || 0,
      bid_win_rate: String(body.bidWinRate || 0),
      revenue_per_thousand: body.revenuePerThousand ? String(body.revenuePerThousand) : null,
      impressions: body.impressions ?? null,
      win_impression_rate: body.winImpressionRate ? String(body.winImpressionRate) : null,
      clicks: body.clicks ?? null,
      ctr: body.ctr ? String(body.ctr) : null,
      cpc: body.cpc ? String(body.cpc) : null,
      is_fallback: body.isFallback ?? false,
      last_updated: body.lastUpdated,
      platforms: body.platforms ?? null,
      code_id: body.codeId ?? null,
      sub_positions: body.subPositions ?? null,
      dsp_sources: body.dspSources ?? null,
      min_version: body.minVersion ?? null,
      max_version: body.maxVersion ?? null,
    };

    const { data, error } = await client.from('ad_sources').upsert(row, { onConflict: 'id' }).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const row: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      groupId: 'group_id', name: 'name', icon: 'icon', status: 'status',
      pricingType: 'pricing_type', price: 'price', priceA: 'price_a', priceB: 'price_b',
      estimatedRevenue: 'estimated_revenue', ecpm: 'ecpm', thousandRequestValue: 'thousand_request_value',
      requests: 'requests', responses: 'responses', responseRate: 'response_rate',
      bidWins: 'bid_wins', bidWinRate: 'bid_win_rate', revenuePerThousand: 'revenue_per_thousand',
      impressions: 'impressions', winImpressionRate: 'win_impression_rate',
      clicks: 'clicks', ctr: 'ctr', cpc: 'cpc', isFallback: 'is_fallback',
      lastUpdated: 'last_updated', platforms: 'platforms', codeId: 'code_id',
      subPositions: 'sub_positions', dspSources: 'dsp_sources',
      minVersion: 'min_version', maxVersion: 'max_version',
    };

    for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
      if (updates[camelKey] !== undefined) {
        let val = updates[camelKey];
        if (['price', 'price_a', 'price_b', 'estimated_revenue', 'ecpm', 'thousand_request_value',
             'response_rate', 'bid_win_rate', 'revenue_per_thousand', 'win_impression_rate',
             'ctr', 'cpc'].includes(snakeKey)) {
          val = String(val);
        }
        row[snakeKey] = val;
      }
    }
    row.updated_at = new Date().toISOString();

    const { data, error } = await client.from('ad_sources').update(row).eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { error } = await client.from('ad_sources').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
