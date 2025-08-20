import { z } from 'zod';

export const plantFieldSchemas = {
  name: z.string().trim().min(1, 'Enter a plant name.'),
  roomId: z.string().min(1, 'Choose a room or add one.'),
  species: z.string().trim().optional(),
  waterEvery: z.coerce.number().min(1, 'Must be at least 1 day'),
  waterAmount: z.coerce.number().min(10, 'Must be at least 10 ml'),
  fertEvery: z.coerce.number().min(1, 'Must be at least 1 day'),
  fertFormula: z.string().trim().optional(),
  lastWatered: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.date({ invalid_type_error: 'Enter a valid date' }).optional(),
  ),
  lastFertilized: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.date({ invalid_type_error: 'Enter a valid date' }).optional(),
  ),
  lat: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z
      .coerce.number()
      .refine((n) => !isNaN(n), { message: 'Latitude must be a number' })
      .refine((n) => n >= -90 && n <= 90, {
        message: 'Latitude must be between -90 and 90',
      })
      .optional(),
  ),
  lon: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z
      .coerce.number()
      .refine((n) => !isNaN(n), { message: 'Longitude must be a number' })
      .refine((n) => n >= -180 && n <= 180, {
        message: 'Longitude must be between -180 and 180',
      })
      .optional(),
  ),
  light: z.string().trim().optional(),
  indoor: z.coerce.boolean().optional(),
  potSize: z.string().trim().optional(),
  potMaterial: z.string().trim().optional(),
  soilType: z.string().trim().optional(),
  drainage: z.enum(['poor', 'ok', 'great']).optional(),
};

export const plantFormSchema = z.object(plantFieldSchemas);
