import { NextRequest, NextResponse } from 'next/server';
import { updateGroup, deleteGroup } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateGroup(id, body);
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteGroup(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: '分组不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除分组失败' },
      { status: 500 }
    );
  }
}