import { PATCH, DELETE } from './route';
import { load, getPlant } from '@/lib/mockdb';

describe('PATCH/DELETE /api/plants/[id]', () => {
  beforeEach(() => {
    load({ plants: [{ id: 'p1', name: 'Aloe', roomId: 'r1', rules: [] }] });
  });

  it('updates existing plant', async () => {
    const req = new Request('http://localhost/api/plants/p1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });
    const res = await PATCH(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('Updated');
    expect(getPlant('p1')?.name).toBe('Updated');
  });

  it('deletes plant', async () => {
    const req = new Request('http://localhost/api/plants/p1', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(getPlant('p1')).toBeUndefined();
  });
});
