import { GET, POST } from './route';
import { createRouteHandlerClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('GET/POST /api/rooms', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns rooms', async () => {
    const rooms = [{ id: 'r1', name: 'Living' }];
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: rooms, error: null }),
    });
    const mockSupabase: any = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
      from: mockFrom,
    };
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(rooms);
    expect(mockFrom).toHaveBeenCalledWith('rooms');
  });

  it('creates room', async () => {
    const created = { id: 'r2', name: 'Bedroom' };
    const mockFrom = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: created, error: null }),
      eq: jest.fn(),
      order: jest.fn(),
    });
    const mockSupabase: any = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
      from: mockFrom,
    };
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = new Request('http://localhost/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: 'Bedroom' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(created);
    expect(mockFrom).toHaveBeenCalledWith('rooms');
  });
});
