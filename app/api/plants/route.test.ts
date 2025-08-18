import { GET, POST } from './route';
import { listPlants, createPlant } from '@/lib/prisma/plants';
import { createRouteHandlerClient } from '@/lib/supabase';

jest.mock('@/lib/prisma/plants', () => ({
  listPlants: jest.fn(),
  createPlant: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('GET/POST /api/plants', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns plants', async () => {
    const plants = [{ id: 'p1', name: 'Fiddle' }];
    (listPlants as jest.Mock).mockResolvedValue(plants);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(plants);
    expect(listPlants).toHaveBeenCalled();
  });

  it('creates plant', async () => {
    const newPlant = { id: 'p_new', name: 'New Plant' };
    (createPlant as jest.Mock).mockResolvedValue(newPlant);

    const mockSupabase = { auth: { getUser: jest.fn() } };
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Plant' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(newPlant);
    expect(createPlant).toHaveBeenCalledWith('user-1', { name: 'New Plant' });
    expect(createRouteHandlerClient).toHaveBeenCalled();
  });
});
