import { NextRequest, NextResponse } from 'next/server';
import { getCareDefaults } from '@/lib/species-care';

export async function GET(req: NextRequest) {
  try {
    const url = (req as any).nextUrl ?? new URL(req.url, 'http://localhost');
    const species = url.searchParams.get('species') || '';
    const key = species.trim().toLowerCase();
    const defaults = await getCareDefaults(species);
    if (!defaults) {
      return NextResponse.json({ presets: null });
    }
    return NextResponse.json({
      presets: defaults,
      presetId: key,
      updated: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('GET /api/species-care failed:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
