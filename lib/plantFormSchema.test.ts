import { plantFormSchema } from './plantFormSchema';

describe('plantFormSchema', () => {
  it('requires name and roomId', () => {
    const res = plantFormSchema.safeParse({
      name: '',
      roomId: '',
      waterEvery: '1',
      waterAmount: '10',
      fertEvery: '1',
    });
    expect(res.success).toBe(false);
    const errors = (res as any).error.flatten().fieldErrors;
    expect(errors.name).toContain('Enter a plant name.');
    expect(errors.roomId).toContain('Choose a room or add one.');
  });

  it('enforces min values', () => {
    const res = plantFormSchema.safeParse({
      name: 'A',
      roomId: 'r1',
      waterEvery: '0',
      waterAmount: '9',
      fertEvery: '0',
    });
    expect(res.success).toBe(false);
    const errors = (res as any).error.flatten().fieldErrors;
    expect(errors.waterEvery).toContain('Must be at least 1 day');
    expect(errors.waterAmount).toContain('Must be at least 10 ml');
    expect(errors.fertEvery).toContain('Must be at least 1 day');
  });

  it('accepts valid data', () => {
    const res = plantFormSchema.safeParse({
      name: 'A',
      roomId: 'r1',
      waterEvery: '1',
      waterAmount: '10',
      fertEvery: '1',
    });
    expect(res.success).toBe(true);
  });
});
