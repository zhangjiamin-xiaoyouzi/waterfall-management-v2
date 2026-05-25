import { NextRequest, NextResponse } from 'next/server';
import { updateSource, deleteSource } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateSource(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: '广告源不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新广告源失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteSource(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: '广告源不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除广告源失败' },
      { status: 500 }
    );
  }
}