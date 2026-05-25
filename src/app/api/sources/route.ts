import { NextRequest, NextResponse } from 'next/server';
import { getSourceById, addSourceToGroup, batchUpdateSources, getAllGroups } from '@/lib/db';

export async function GET() {
  try {
    const groups = getAllGroups();
    const allSources = groups.flatMap((g) => g.adSources);
    return NextResponse.json({ success: true, data: allSources });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取广告源列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, source } = body;
    if (!groupId || !source || !source.id) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段（groupId, source.id）' },
        { status: 400 }
      );
    }
    const created = addSourceToGroup(groupId, source);
    if (!created) {
      return NextResponse.json(
        { success: false, error: '分组不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '添加广告源失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceIds, updates } = body;
    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0 || !updates) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段（sourceIds, updates）' },
        { status: 400 }
      );
    }
    const count = batchUpdateSources(sourceIds, updates);
    return NextResponse.json({ success: true, data: { updatedCount: count } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '批量更新广告源失败' },
      { status: 500 }
    );
  }
}