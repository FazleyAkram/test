import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For now we just acknowledge save (persistence can be wired to DB later)
    const { report } = await request.json();
    if (!report) return NextResponse.json({ error: 'Missing report' }, { status: 400 });
    return NextResponse.json({ success: true, id: report.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}









