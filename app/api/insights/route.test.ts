import { GET } from './route';
import { createRouteHandlerClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('GET /api/insights', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  it('returns data for default range', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-05-03'));

    const plantData = [
      { created_at: '2024-05-01T10:00:00Z' },
      { created_at: '2024-05-01T12:00:00Z' },
    ];
    const taskData = [{ due_at: '2024-05-02T00:00:00Z' }];

    const mockPlantQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue({ data: plantData, error: null }),
    };
    const mockTaskQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue({ data: taskData, error: null }),
    };
    const mockFrom = jest.fn((table: string) =>
      table === 'plants' ? mockPlantQuery : mockTaskQuery
    );

    (createRouteHandlerClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
      from: mockFrom,
    });

    const res = await GET(new Request('http://localhost/api/insights') as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(7);
    expect(json).toContainEqual({ period: '2024-05-01', plantCount: 2, taskCount: 0 });
    expect(json).toContainEqual({ period: '2024-05-02', plantCount: 0, taskCount: 1 });

    jest.useRealTimers();
  });

  it('returns data for custom range', async () => {
    const plantData = [{ created_at: '2024-05-01T10:00:00Z' }];
    const taskData = [{ due_at: '2024-05-02T00:00:00Z' }];

    const mockPlantQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue({ data: plantData, error: null }),
    };
    const mockTaskQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue({ data: taskData, error: null }),
    };
    const mockFrom = jest.fn((table: string) =>
      table === 'plants' ? mockPlantQuery : mockTaskQuery
    );

    (createRouteHandlerClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
      from: mockFrom,
    });

    const res = await GET(
      new Request('http://localhost/api/insights?start=2024-05-01&end=2024-05-02') as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([
      { period: '2024-05-01', plantCount: 1, taskCount: 0 },
      { period: '2024-05-02', plantCount: 0, taskCount: 1 },
    ]);
  });
});
