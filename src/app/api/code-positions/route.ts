import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const scene = searchParams.get('scene');
    const platform = searchParams.get('platform');
    const slot = searchParams.get('slot');
    const dspSource = searchParams.get('dspSource');

    let query = client.from('code_positions').select('*').order('id');
    if (scene) query = query.eq('scene', scene);
    if (platform) query = query.eq('platform', platform);
    if (slot) query = query.eq('slot', slot);
    if (dspSource) query = query.eq('dsp_source', dspSource);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result = (data || []).map((cp: Record<string, unknown>) => ({
      id: cp.id,
      codeId: cp.code_id,
      name: cp.name,
      platform: cp.platform,
      dspSource: cp.dsp_source,
      scene: cp.scene,
      slot: cp.slot,
      slotName: cp.slot_name,
      status: cp.status,
      minVersion: cp.min_version,
      maxVersion: cp.max_version,
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
      code_id: body.codeId,
      name: body.name,
      platform: body.platform,
      dsp_source: body.dspSource,
      scene: body.scene,
      slot: body.slot,
      slot_name: body.slotName,
      status: body.status || 'enabled',
      min_version: body.minVersion || null,
      max_version: body.maxVersion || null,
    };

    const { data, error } = await client.from('code_positions').upsert(row, { onConflict: 'id' }).select();
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
    if (updates.codeId !== undefined) row.code_id = updates.codeId;
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.platform !== undefined) row.platform = updates.platform;
    if (updates.dspSource !== undefined) row.dsp_source = updates.dspSource;
    if (updates.scene !== undefined) row.scene = updates.scene;
    if (updates.slot !== undefined) row.slot = updates.slot;
    if (updates.slotName !== undefined) row.slot_name = updates.slotName;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.minVersion !== undefined) row.min_version = updates.minVersion || null;
    if (updates.maxVersion !== undefined) row.max_version = updates.maxVersion || null;
    row.updated_at = new Date().toISOString();

    const { data, error } = await client.from('code_positions').update(row).eq('id', id).select();
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

    const { error } = await client.from('code_positions').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
