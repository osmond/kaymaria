import { GET } from './route';

describe('GET /api/species-search', () => {
  it('returns matching species', async () => {
    const req = new Request('http://localhost/api/species-search?q=fic');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.some((s: any) => s.species.toLowerCase().includes('fic'))).toBe(true);
  });

  it('returns empty array for empty query', async () => {
    const req = new Request('http://localhost/api/species-search?q=');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });
});
