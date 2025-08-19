import { POST } from './route';
import { createRouteHandlerClient } from '@/lib/supabase';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

jest.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(),
}));

jest.mock('@/lib/supabaseAdmin', () => ({
  createSupabaseAdminClient: jest.fn(),
}));

describe('POST /api/sync', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SINGLE_USER_MODE;
    delete process.env.SINGLE_USER_ID;
  });

  it('returns ok', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(mockSupabase);
    (createSupabaseAdminClient as jest.Mock).mockReturnValue({});

    const res = await POST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(createSupabaseAdminClient).toHaveBeenCalled();
  });
});

