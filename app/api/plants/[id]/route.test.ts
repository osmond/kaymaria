import { GET, PATCH, DELETE } from './route';
import {
  getPlant,
  getComputedWaterInfo,
  updatePlant,
  deletePlant,
} from '@/lib/prisma/plants';

jest.mock('@/lib/prisma/plants', () => ({
  getPlant: jest.fn(),
  getComputedWaterInfo: jest.fn(),
  updatePlant: jest.fn(),
  deletePlant: jest.fn(),
}));

describe('GET/PATCH/DELETE /api/plants/[id]', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns plant with serialized dates', async () => {
    (getPlant as jest.Mock).mockResolvedValue({
      id: 'p1',
      name: 'Test',
      lastWateredAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    (getComputedWaterInfo as jest.Mock).mockReturnValue({});
    const res = await GET({} as any, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.lastWateredAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('updates existing plant', async () => {
    (updatePlant as jest.Mock).mockResolvedValue({ id: 'p1', name: 'Updated' });
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
