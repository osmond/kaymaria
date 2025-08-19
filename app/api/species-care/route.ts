import { NextRequest, NextResponse } from 'next/server';
import { getCareDefaults } from '@/lib/species-care';
import { normalizeSpecies } from '@/lib/species';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species') || '';
    const key = normalizeSpecies(species);
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
