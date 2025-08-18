import { GET, POST } from '@/app/api/plants/route';
import { PATCH, DELETE } from '@/app/api/plants/[id]/route';
import { load, listPlants, Plant } from '@/lib/mockdb';
import { NextRequest } from 'next/server';

describe('GET /api/plants', () => {
  it('returns all plants', async () => {
    const initial: Plant[] = [{ id: 'p1', name: 'Aloe', roomId: 'living', rules: [] }];
    load({ plants: initial, tasks: [] });
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(initial);
  });
});

describe('POST /api/plants', () => {
  it('creates a new plant', async () => {
    load({ plants: [], tasks: [] });
    const req = new NextRequest('http://test/api/plants', {
      method: 'POST',
      body: JSON.stringify({ name: 'Fern', room: 'living' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ name: 'Fern', roomId: 'living' });
    expect(listPlants()).toHaveLength(1);
  });
});

describe('PATCH /api/plants/[id]', () => {
  it('updates a plant', async () => {
    load({ plants: [{ id: 'p1', name: 'Aloe', roomId: 'living', rules: [] }], tasks: [] });
    const req = new Request('http://test/api/plants/p1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Aloe Vera' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await PATCH(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Aloe Vera');
    expect(listPlants()[0].name).toBe('Aloe Vera');
  });
});

describe('DELETE /api/plants/[id]', () => {
  it('removes a plant', async () => {
    load({ plants: [{ id: 'p1', name: 'Aloe', roomId: 'living', rules: [] }], tasks: [] });
    const req = new Request('http://test/api/plants/p1', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(listPlants()).toHaveLength(0);
  });
});
