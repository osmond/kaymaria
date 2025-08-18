import { NextRequest, NextResponse } from 'next/server';
import { suggestCare } from '@/lib/aiCare';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const suggestion = await suggestCare(body);
    return NextResponse.json(suggestion);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
