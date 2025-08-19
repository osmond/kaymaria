import OpenAI from 'openai';

export type AiCareParams = {
  name?: string;
  species?: string;
  potSize?: string;
  potMaterial?: string;
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
};

export async function suggestCare({
  name = 'Plant',
  species = '',
  potSize = '',
  potMaterial = '',
  lat,
  lon,
}: AiCareParams): Promise<AiCareSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }
  const client = new OpenAI({ apiKey });

  const location =
    typeof lat === 'number' && typeof lon === 'number'
      ? ` at latitude ${lat} and longitude ${lon}`
      : '';

  const prompt = `Suggest a simple care plan for a plant.\nName: ${name}\nSpecies: ${species}\nPot size: ${potSize}\nPot material: ${potMaterial}${location}\nReturn a JSON object with fields: waterEvery (days), waterAmount (ml), fertEvery (days), fertFormula (string).`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
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
  };
}

