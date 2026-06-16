import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const scene = searchParams.get('scene');
    const platform = searchParams.get('platform');

    let query = client.from('ad_groups').select('*').order('priority', { ascending: true });
    if (scene) query = query.eq('scene', scene);
    if (platform) query = query.eq('platform', platform);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Transform snake_case to camelCase for frontend
    const result = (data || []).map((g: Record<string, unknown>) => ({
      id: g.id,
      name: g.name,
      priority: g.priority as number === 999999 ? Infinity : g.priority,
      platforms: g.platforms,
      adSlots: g.ad_slots,
      scene: g.scene,
      platform: g.platform,
      rules: (g.rules as Array<Record<string, unknown>>)?.map((r: Record<string, unknown>) => ({
        ruleType: r.rule_type,
        matchType: r.match_type,
        values: r.values,
      })) || [],
      status: g.status,
      floorPrice: parseFloat(g.floor_price as string || '0'),
      hasABTest: g.has_ab_test ?? false,
      abTestStarted: g.ab_test_started ?? false,
      abTestDraftData: g.ab_test_draft,
      adSources: [],
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
      name: body.name,
      priority: body.priority === Infinity ? 999999 : body.priority,
      platforms: body.platforms,
      ad_slots: body.adSlots,
      scene: body.scene,
      platform: body.platform,
      rules: (body.rules || []).map((r: Record<string, unknown>) => ({
        rule_type: r.ruleType,
        match_type: r.matchType,
        values: r.values,
      })),
      status: body.status || 'enabled',
      floor_price: String(body.floorPrice || 0),
      has_ab_test: body.hasABTest ?? false,
      ab_test_started: body.abTestStarted ?? false,
      ab_test_draft: body.abTestDraftData ?? null,
    };

    const { data, error } = await client.from('ad_groups').upsert(row, { onConflict: 'id' }).select();
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
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.priority !== undefined) row.priority = updates.priority === Infinity ? 999999 : updates.priority;
    if (updates.platforms !== undefined) row.platforms = updates.platforms;
    if (updates.adSlots !== undefined) row.ad_slots = updates.adSlots;
    if (updates.scene !== undefined) row.scene = updates.scene;
    if (updates.platform !== undefined) row.platform = updates.platform;
    if (updates.rules !== undefined) row.rules = updates.rules.map((r: Record<string, unknown>) => ({ rule_type: r.ruleType, match_type: r.matchType, values: r.values }));
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.floorPrice !== undefined) row.floor_price = String(updates.floorPrice);
    if (updates.hasABTest !== undefined) row.has_ab_test = updates.hasABTest;
    if (updates.abTestStarted !== undefined) row.ab_test_started = updates.abTestStarted;
    if (updates.abTestDraftData !== undefined) row.ab_test_draft = updates.abTestDraftData;
    row.updated_at = new Date().toISOString();

    const { data, error } = await client.from('ad_groups').update(row).eq('id', id).select();
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

    const { error } = await client.from('ad_groups').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
