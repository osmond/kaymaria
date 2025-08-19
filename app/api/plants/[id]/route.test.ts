import { PATCH, DELETE } from './route';
import { updatePlant, deletePlant } from '@/lib/prisma/plants';
import { createRouteHandlerClient } from '@/lib/supabase';

jest.mock('@/lib/prisma/plants', () => ({
  updatePlant: jest.fn(),
  deletePlant: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('PATCH/DELETE /api/plants/[id]', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.DATABASE_URL = 'postgres://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SINGLE_USER_MODE;
    delete process.env.SINGLE_USER_ID;
  });

  function setupSupabase() {
    const supabase: any = {
      auth: { getUser: jest.fn() },
      from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'r1' }, error: null }) }) }) }) }),
    };
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createRouteHandlerClient as jest.Mock).mockResolvedValue(supabase);
  }

  it('updates existing plant', async () => {
    (updatePlant as jest.Mock).mockResolvedValue({ id: 'p1', name: 'Updated' });
    setupSupabase();
    const req = new Request('http://localhost/api/plants/p1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });
    const res = await PATCH(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('Updated');
    expect(updatePlant).toHaveBeenCalledWith('p1', { name: 'Updated' });
  });

  it('deletes plant', async () => {
    (deletePlant as jest.Mock).mockResolvedValue(true);
    const req = new Request('http://localhost/api/plants/p1', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(deletePlant).toHaveBeenCalledWith('p1');
  });
});
