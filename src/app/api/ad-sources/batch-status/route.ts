import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { sourceIds, ids, status } = body;
    const idList = sourceIds || ids;

    if (!idList || !Array.isArray(idList) || idList.length === 0) {
      return NextResponse.json({ error: 'sourceIds is required' }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const { data, error } = await client
      .from('ad_sources')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', idList)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
