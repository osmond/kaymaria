import { NextRequest, NextResponse } from 'next/server';
import { SPECIES } from '@/lib/species';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    if (!q) {
      return NextResponse.json([]);
    }
    const matches = SPECIES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.species.toLowerCase().includes(q)
    ).slice(0, 10);
    return NextResponse.json(matches);
  } catch (e) {
    console.error('GET /api/species-search failed:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
