import { z } from 'zod';
import { normalizeSpecies, ALLOWED_SPECIES } from './species';

export const plantFieldSchemas = {
  name: z.string().trim().min(1, 'Enter a plant name.'),
  roomId: z.string().min(1, 'Choose a room or add one.'),
  species: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeSpecies(v) : undefined))
    .refine(
      (v) => v === undefined || ALLOWED_SPECIES.includes(v),
      'Invalid species',
    ),
  waterEvery: z.coerce.number().int().min(1, 'Must be at least 1 day'),
  waterAmount: z.coerce.number().int().min(10, 'Must be at least 10 ml'),
  fertEvery: z.coerce.number().int().min(1, 'Must be at least 1 day'),
  lastWatered: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
  lastFertilized: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
  lat: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v || (!isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90),
      { message: 'Latitude must be between -90 and 90' },
    ),
  lon: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v || (!isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180),
      { message: 'Longitude must be between -180 and 180' },
    ),
};

export const plantFormSchema = z.object(plantFieldSchemas);

export const plantServerSchema = z.object({
  name: z.string().trim().min(1),
  roomId: z.string().min(1),
  species: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeSpecies(v) : undefined))
    .refine((v) => v === undefined || ALLOWED_SPECIES.includes(v), 'Invalid species'),
  potSize: z.string().optional(),
  potMaterial: z.string().optional(),
  lightLevel: z.string().optional(),
  indoor: z.boolean().optional(),
  soilType: z.string().optional(),
  drainage: z.enum(['poor', 'ok', 'great']).optional(),
  carePlanSource: z.string().optional(),
  aiModel: z.string().optional(),
  aiVersion: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  lastWateredAt: z.string().datetime().optional(),
  lastFertilizedAt: z.string().datetime().optional(),
  rules: z
    .array(
      z.object({
        type: z.enum(['water', 'fertilize']),
        intervalDays: z.number().int().min(1),
        amountMl: z.number().int().min(10).optional(),
        formula: z.string().optional(),
      }),
    )
    .optional(),
});
