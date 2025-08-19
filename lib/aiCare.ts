import OpenAI from 'openai';

export type AiCareParams = {
  name?: string;
  species?: string;
  potSize?: string;
  potHeight?: string;
  potMaterial?: string;
  light?: string;
  indoor?: boolean;
  drainage?: string;
  soil?: string;
  humidity?: number;
  lat?: number;
  lon?: number;
};

export type AiCareSuggestion = {
  waterEvery: number;
  waterAmount: number;
  fertEvery: number;
  fertFormula?: string;
  model?: string;
  version?: string;
  et0?: number;
  weatherSource?: string;
  fetchedAt?: string;
};

export async function suggestCare({
  name = 'Plant',
  species = '',
  potSize = '',
  potHeight = '',
  potMaterial = '',
  light = '',
  indoor,
  drainage = '',
  soil = '',
  humidity,
  lat,
  lon,
}: AiCareParams): Promise<AiCareSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }
  const client = new OpenAI({ apiKey });

  const parts = [
    `Name: ${name}`,
    `Species: ${species}`,
    `Pot size: ${potSize}`,
    `Pot height: ${potHeight}`,
    `Pot material: ${potMaterial}`,
  ];
  if (light) parts.push(`Light: ${light}`);
  if (typeof indoor === 'boolean') parts.push(indoor ? 'Indoor' : 'Outdoor');
  if (drainage) parts.push(`Drainage: ${drainage}`);
  if (soil) parts.push(`Soil: ${soil}`);
  if (typeof humidity === 'number') parts.push(`Humidity: ${humidity}%`);

  let et0: number | null = null;
  let weatherSource: string | undefined;
  if (typeof lat === 'number' && typeof lon === 'number') {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=et0_fao_evapotranspiration&timezone=auto`;
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        et0 = data.daily?.et0_fao_evapotranspiration?.[0] ?? null;
        weatherSource = 'Open-Meteo';
      }
    } catch {}
  }

  if (et0 !== null) parts.push(`Evapotranspiration: ${et0.toFixed(2)}mm`);

  const month = new Date().getMonth();
  const season =
    month < 2 || month === 11
      ? 'winter'
      : month < 5
      ? 'spring'
      : month < 8
      ? 'summer'
      : 'fall';
  parts.push(`Season: ${season}`);

  const prompt = `Suggest a simple care plan for a plant.\n${parts.join('\n')}\nReturn a JSON object with fields: waterEvery (days), waterAmount (ml), fertEvery (days), fertFormula (string).`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful plant care assistant that replies in JSON.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const result = completion.choices[0]?.message?.content;
  if (!result) {
    throw new Error('No response from model');
  }

  const data = JSON.parse(result);
  return {
    waterEvery: data.waterEvery,
    waterAmount: data.waterAmount,
    fertEvery: data.fertEvery,
    fertFormula: data.fertFormula,
    model: completion.model,
    version: completion.system_fingerprint,
    et0: et0 ?? undefined,
    weatherSource,
    fetchedAt: new Date().toISOString(),
  };
}

