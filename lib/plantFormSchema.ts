import { z } from 'zod';

export const indoorEnum = z.enum(['Indoor', 'Outdoor']);
export type IndoorOption = z.infer<typeof indoorEnum>;

export const drainageEnum = z.enum(['poor', 'ok', 'great']);
export type DrainageOption = z.infer<typeof drainageEnum>;

export const plantFieldSchemas = {
  name: z.string().trim().min(1, 'Enter a plant name.'),
  roomId: z.string().min(1, 'Choose a room or add one.'),
  indoor: indoorEnum,
  drainage: drainageEnum,
  waterEvery: z.coerce.number().min(1, 'Must be at least 1 day'),
  waterAmount: z.coerce.number().min(10, 'Must be at least 10 ml'),
  fertEvery: z.coerce.number().min(1, 'Must be at least 1 day'),
  lastWatered: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
  lastFertilized: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
};

export const plantFormSchema = z.object(plantFieldSchemas);
