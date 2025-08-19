import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const image = data.get('image');
    if (!image || typeof image === 'string') {
      return NextResponse.json({ error: 'no-image' }, { status: 400 });
    }
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return NextResponse.json({ error: 'not-configured' }, { status: 500 });
    }
    const form = new FormData();
    form.append('images', image);
    form.append('similar_images', 'false');
    const res = await fetch('https://api.plant.id/v3/identify', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
      },
      body: form as any,
    });
    if (!res.ok) {
      console.error('plant.id error', res.status);
      return NextResponse.json({ error: 'upstream' }, { status: 502 });
    }
    const json = await res.json();
    const suggestion = json?.suggestions?.[0];
    const name = suggestion?.plant_name;
    const species =
      suggestion?.plant_details?.scientific_name || suggestion?.plant_name;
    return NextResponse.json({ name, species });
  } catch (e) {
    console.error('POST /api/species-identify failed', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
