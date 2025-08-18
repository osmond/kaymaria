import { NextRequest, NextResponse } from 'next/server';
import { getCareDefaults } from '@/lib/species-care';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species') || '';
    const defaults = await getCareDefaults(species);
    if (!defaults) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json(defaults);
  } catch (e: any) {
    console.error('GET /api/species-care failed:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
