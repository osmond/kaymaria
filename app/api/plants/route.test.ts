import { GET, POST } from './route';
import { createRouteHandlerClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('GET/POST /api/plants', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns plants for authenticated user', async () => {
    const plants = [{ id: 'p1', user_id: 'user1', name: 'Fiddle' }];
    const order = jest.fn().mockResolvedValue({ data: plants, error: null });
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user1' } }, error: null }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order,
      }),
    };
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(supabase);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(plants);
    expect(order).toHaveBeenCalledWith('name');
  });

  it('creates plant for authenticated user', async () => {
    const newPlant = { id: 'p_new', name: 'New Plant', user_id: 'user1' };
    const single = jest.fn().mockResolvedValue({ data: newPlant, error: null });
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user1' } }, error: null }) },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single,
          }),
        }),
      }),
    };
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(supabase);

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Plant' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(newPlant);
    expect(single).toHaveBeenCalled();
  });
});
