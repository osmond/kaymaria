import { z } from 'zod';
import { SPECIES } from './species';

export function normalizeSpecies(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const allowedSpecies = new Set(
  SPECIES.map((s) => normalizeSpecies(s.species)!)
);
allowedSpecies.add('custom');
allowedSpecies.add('unknown');

const potMaterials = ['Plastic', 'Terracotta', 'Ceramic'] as const;
const lightLevels = ['Low', 'Medium', 'Bright'] as const;
const drainageLevels = ['poor', 'ok', 'great'] as const;

export const plantInputSchema = z.object({
  name: z.string().trim().min(1),
  roomId: z.string().min(1),
  species: z
    .string()
    .optional()
    .transform((v) => normalizeSpecies(v))
    .refine((v) => v === undefined || allowedSpecies.has(v), {
      message: 'invalid species',
    }),
  potSize: z.string().trim().min(1),
  potMaterial: z.enum(potMaterials),
  lightLevel: z.enum(lightLevels),
  indoor: z.boolean(),
  soilType: z.string().trim().optional(),
  drainage: z.enum(drainageLevels),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  carePlanSource: z.string().trim().optional(),
  aiModel: z.string().trim().optional(),
  aiVersion: z.string().trim().optional(),
  presetId: z.string().trim().optional(),
  lastWateredAt: z.string().datetime().optional(),
  lastFertilizedAt: z.string().datetime().optional(),
  rules: z
    .array(
      z.object({
        type: z.enum(['water', 'fertilize']),
        intervalDays: z.number().int().min(1).max(365),
        amountMl: z.number().int().min(10).max(10000).optional(),
        formula: z.string().trim().optional(),
      })
    )
    .optional(),
});

export type PlantInput = z.infer<typeof plantInputSchema>;
export const allowedPotMaterials = potMaterials;
export const allowedLightLevels = lightLevels;
export const allowedDrainage = drainageLevels;
export const allowedSpeciesSlugs = allowedSpecies;
