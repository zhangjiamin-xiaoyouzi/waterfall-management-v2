import { NextRequest, NextResponse } from 'next/server';
import { getAllGroups, createGroup, updateGroup } from '@/lib/db';

export async function GET() {
  try {
    const groups = getAllGroups();
    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取分组列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group } = body;
    if (!group || !group.id || !group.name) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段（id, name）' },
        { status: 400 }
      );
    }
    const created = createGroup(group);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建分组失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少分组ID' },
        { status: 400 }
      );
    }
    const updated = updateGroup(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: '分组不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新分组失败' },
      { status: 500 }
    );
  }
}