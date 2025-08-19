export type SpeciesRecord = {
  name: string;
  species: string;
};

export const SPECIES: SpeciesRecord[] = [
  { name: 'Fiddle Leaf Fig', species: 'Ficus lyrata' },
  { name: 'Monstera', species: 'Monstera deliciosa' },
  { name: 'Snake Plant', species: 'Sansevieria trifasciata' },
  { name: 'ZZ Plant', species: 'Zamioculcas zamiifolia' },
  { name: 'Peace Lily', species: 'Spathiphyllum wallisii' },
  { name: 'Aloe Vera', species: 'Aloe vera' },
  { name: 'Boston Fern', species: 'Nephrolepis exaltata' },
  { name: 'Spider Plant', species: 'Chlorophytum comosum' },
  { name: 'Pothos', species: 'Epipremnum aureum' },
  { name: 'Rubber Plant', species: 'Ficus elastica' },
];

export function normalizeSpecies(species: string): string {
  return species
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const ALLOWED_SPECIES = [
  ...SPECIES.map((s) => normalizeSpecies(s.species)),
  'unknown',
  'custom',
];

