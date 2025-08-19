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

function makeSupabase(roomExists = true) {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest
      .fn()
      .mockResolvedValue(
        roomExists ? { data: { id: 'r1' }, error: null } : { data: null, error: {} }
      ),
  };
  return {
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
    },
    from: jest.fn(() => query),
  } as any;
}

const basePayload = {
  name: 'New Plant',
  roomId: 'r1',
  species: 'Ficus lyrata',
  potSize: '10 in',
  potMaterial: 'Plastic',
  lightLevel: 'Bright',
  indoor: true,
  drainage: 'ok',
  rules: [{ type: 'water', intervalDays: 7, amountMl: 500 }],
};

describe('GET/POST /api/plants', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.DATABASE_URL = 'postgres://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SINGLE_USER_MODE;
    delete process.env.SINGLE_USER_ID;
  });

  it('returns plants', async () => {
    const plants = [
      {
        id: 'p1',
        name: 'Fiddle',
        lastWateredAt: new Date('2024-01-01T00:00:00.000Z'),
        lastFertilizedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ];
    (listPlants as jest.Mock).mockResolvedValue(plants);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([
      {
        id: 'p1',
        name: 'Fiddle',
        lastWateredAt: '2024-01-01T00:00:00.000Z',
        lastFertilizedAt: '2024-01-02T00:00:00.000Z',
      },
    ]);
    expect(listPlants).toHaveBeenCalled();
  });

  it('creates plant', async () => {
    const newPlant = { id: 'p_new', name: 'New Plant' };
    (createPlant as jest.Mock).mockResolvedValue(newPlant);

    const mockSupabase = makeSupabase();
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify(basePayload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    await res.json();
    expect(createPlant).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ species: 'ficus-lyrata', roomId: 'r1' })
    );
  });

  it('rejects invalid lat', async () => {
    const mockSupabase = makeSupabase();
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, lat: 200 }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    expect(createPlant).not.toHaveBeenCalled();
  });

  it('passes care plan details', async () => {
    const newPlant = { id: 'p_new', name: 'New Plant' };
    (createPlant as jest.Mock).mockResolvedValue(newPlant);
    const mockSupabase = makeSupabase();
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        carePlanSource: 'ai',
        aiModel: 'gpt',
        aiVersion: '1',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    await res.json();
    expect(createPlant).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        carePlanSource: 'ai',
        aiModel: 'gpt',
        aiVersion: '1',
      })
    );
  });

  it('passes last care dates when provided', async () => {
    const newPlant = {
      id: 'p_new',
      name: 'New Plant',
      lastWateredAt: new Date('2024-01-01T00:00:00.000Z'),
      lastFertilizedAt: new Date('2024-01-02T00:00:00.000Z'),
    };
    (createPlant as jest.Mock).mockResolvedValue(newPlant);
    const mockSupabase = makeSupabase();
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        lastWateredAt: '2024-01-01T00:00:00.000Z',
        lastFertilizedAt: '2024-01-02T00:00:00.000Z',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(createPlant).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        lastWateredAt: '2024-01-01T00:00:00.000Z',
        lastFertilizedAt: '2024-01-02T00:00:00.000Z',
      })
    );
    expect(json.lastWateredAt).toBe('2024-01-01T00:00:00.000Z');
    expect(json.lastFertilizedAt).toBe('2024-01-02T00:00:00.000Z');
  });

  it('passes care plan when rules provided', async () => {
    const newPlant = { id: 'p_new', name: 'New Plant' };
    (createPlant as jest.Mock).mockResolvedValue(newPlant);
    const mockSupabase = makeSupabase();
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify(basePayload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    await res.json();
    expect(createPlant).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ carePlan: basePayload.rules })
    );
  });

  it('returns 503 when env vars missing', async () => {
    delete process.env.DATABASE_URL;
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json).toEqual({
      error: 'misconfigured server',
      message:
        'Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and DATABASE_URL, or enable SINGLE_USER_MODE',
    });
    expect(listPlants).not.toHaveBeenCalled();
  });

  it('returns 500 when SINGLE_USER_ID missing in single-user mode', async () => {
    process.env.SINGLE_USER_MODE = 'true';
    delete process.env.SINGLE_USER_ID;
    const req = new Request('http://localhost/api/plants', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: 'misconfigured server' });
    expect(createRouteHandlerClient).toHaveBeenCalled();
  });
});
