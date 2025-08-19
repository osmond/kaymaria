import data from './usda-care.json';
import { normalizeSpecies } from './species';

export type CareSuggest = {
  version: string;
  water: { intervalDays: number; amountMl?: number; notes?: string };
  fertilize: { intervalDays: number; formula?: string; notes?: string };
  repot?: { intervalDays?: number; notes?: string };
  assumptions?: string[];
  warnings?: string[];
  confidence?: number;
};

type SpeciesInfo = {
  waterInterval: number;
  waterAmount: number;
  fertInterval: number;
  fertFormula: string;
};

const CARE_DATA = data as Record<string, SpeciesInfo>;

export async function fetchCareRules(
  species: string,
  lat: number,
  lon: number
): Promise<CareSuggest> {
  const key = normalizeSpecies(species);
  const info = CARE_DATA[key] || CARE_DATA['default'];

  let interval = info.waterInterval;
  let amount = info.waterAmount;
  let et0: number | null = null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=et0_fao_evapotranspiration&timezone=auto`;
    const r = await fetch(url);
    if (r.ok) {
      const json = await r.json();
      et0 = json.daily?.et0_fao_evapotranspiration?.[0] ?? null;
      if (typeof et0 === 'number') {
        if (et0 > 5) interval = Math.max(1, interval - 2);
        else if (et0 > 3) interval = Math.max(1, interval - 1);
        else if (et0 < 1) interval = interval + 1;
      }
    }
  } catch {
    // ignore network errors
  }

  return {
    version: 'usda-v1',
    water: {
      intervalDays: interval,
      amountMl: amount,
      notes: et0 ? `Adjusted for ET₀ ${et0.toFixed(2)}mm` : undefined,
    },
    fertilize: {
      intervalDays: info.fertInterval,
      formula: info.fertFormula,
    },
    assumptions: ['Based on USDA dataset', `Species: ${species || 'unknown'}`],
  };
}
