export type SpeciesCareDefaults = {
  pot: string;
  potMaterial: string;
  light: string;
  indoor: 'Indoor' | 'Outdoor';
  drainage: 'poor' | 'ok' | 'great';
  soil: string;
  waterEvery: string;
  waterAmount: string;
  fertEvery: string;
  fertFormula: string;
};

const DEFAULTS: Record<string, SpeciesCareDefaults> = {
  'Ficus lyrata': {
    pot: '12 in',
    potMaterial: 'Ceramic',
    light: 'Bright indirect',
    indoor: 'Indoor',
    drainage: 'ok',
    soil: 'Well-draining mix',
    waterEvery: '7',
    waterAmount: '500',
    fertEvery: '30',
    fertFormula: '10-10-10 @ 1/2 strength',
  },
  'Monstera deliciosa': {
    pot: '10 in',
    potMaterial: 'Plastic',
    light: 'Medium',
    indoor: 'Indoor',
    drainage: 'ok',
    soil: 'Well-draining mix',
    waterEvery: '7',
    waterAmount: '500',
    fertEvery: '30',
    fertFormula: '10-10-10 @ 1/2 strength',
  },
};

export async function getCareDefaults(species: string): Promise<SpeciesCareDefaults | null> {
  return DEFAULTS[species] ?? null;
}
