/**
 * Care defaults for supported plant species.
 *
 * To add a new species, append an entry to the `DEFAULTS` map with the
 * botanical name in lowercase as the key. All properties defined in the
 * `SpeciesCareDefaults` type must be provided so that lookups remain
 * consistent.
 */
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

import { normalizeSpecies } from './species';

const DEFAULTS: Record<string, SpeciesCareDefaults> = {
  'ficus-lyrata': {
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
  'monstera-deliciosa': {
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
  'zamioculcas-zamiifolia': {
    pot: '8 in',
    potMaterial: 'Plastic',
    light: 'Low to bright indirect',
    indoor: 'Indoor',
    drainage: 'ok',
    soil: 'Well-draining mix',
    waterEvery: '14',
    waterAmount: '250',
    fertEvery: '60',
    fertFormula: '10-10-10 @ 1/2 strength',
  },
  'epipremnum-aureum': {
    pot: '6 in',
    potMaterial: 'Plastic',
    light: 'Low to medium',
    indoor: 'Indoor',
    drainage: 'ok',
    soil: 'Well-draining mix',
    waterEvery: '7',
    waterAmount: '250',
    fertEvery: '30',
    fertFormula: '10-10-10 @ 1/2 strength',
  },
  'sansevieria-trifasciata': {
    pot: '8 in',
    potMaterial: 'Terra cotta',
    light: 'Low to bright indirect',
    indoor: 'Indoor',
    drainage: 'great',
    soil: 'Succulent mix',
    waterEvery: '21',
    waterAmount: '250',
    fertEvery: '60',
    fertFormula: '10-10-10 @ 1/2 strength',
  },
};

export async function getCareDefaults(
  species: string,
): Promise<SpeciesCareDefaults | null> {
  const key = normalizeSpecies(species);
  return DEFAULTS[key] ?? null;
}
