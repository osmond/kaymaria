import { NextRequest, NextResponse } from 'next/server';
import { SPECIES, SpeciesRecord } from '@/lib/species';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) {
      return NextResponse.json([]);
    }

    let results: SpeciesRecord[] = [];
    const token = process.env.TREFLE_API_TOKEN;

    if (token) {
      try {
        const res = await fetch(
          `https://trefle.io/api/v1/plants/search?q=${encodeURIComponent(q)}&token=${token}`
        );
        if (res.ok) {
          const json = await res.json();
          results = (json.data || [])
            .slice(0, 10)
            .map((p: any) => ({
              name: p.common_name || p.scientific_name,
              species: p.scientific_name,
            }));
        } else {
          console.error('Trefle API error', res.status);
        }
      } catch (err) {
        console.error('Trefle API request failed', err);
      }
    }

    if (!results.length) {
      const qLower = q.toLowerCase();
      results = SPECIES.filter(
        (s) =>
          s.name.toLowerCase().includes(qLower) ||
          s.species.toLowerCase().includes(qLower)
      ).slice(0, 10);
    }

    return NextResponse.json(results);
  } catch (e) {
    console.error('GET /api/species-search failed:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
