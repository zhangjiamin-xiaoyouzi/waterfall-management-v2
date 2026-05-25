import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: '功能尚未实现' },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: '功能尚未实现' },
    { status: 501 }
  );
}