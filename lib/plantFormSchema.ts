import { z } from 'zod';

export const plantFieldSchemas = {
  name: z.string().trim().min(1, 'Enter a plant name.'),
  roomId: z.string().min(1, 'Choose a room or add one.'),
  waterEvery: z
    .coerce.number()
    .min(1, 'Must be at least 1 day')
    .max(365, 'Must be at most 365 days'),
  waterAmount: z
    .coerce.number()
    .min(10, 'Must be at least 10 ml')
    .max(10000, 'Must be at most 10000 ml'),
  fertEvery: z
    .coerce.number()
    .min(1, 'Must be at least 1 day')
    .max(365, 'Must be at most 365 days'),
  lastWatered: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
  lastFertilized: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
};

export const plantFormSchema = z.object(plantFieldSchemas);
