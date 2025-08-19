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

  it('queries Trefle when token present', async () => {
    const oldFetch = global.fetch;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ common_name: 'Rose', scientific_name: 'Rosa rubiginosa' }],
      }),
    } as any);
    (global as any).fetch = mockFetch;
    process.env.TREFLE_API_TOKEN = 'token';

    const req = new Request('http://localhost/api/species-search?q=rose');
    const res = await GET(req as any);
    const json = await res.json();

    expect(mockFetch).toHaveBeenCalled();
    expect(json).toEqual([
      { name: 'Rose', species: 'Rosa rubiginosa' },
    ]);

    delete process.env.TREFLE_API_TOKEN;
    (global as any).fetch = oldFetch;
  });

  it('falls back to local species when Trefle fails', async () => {
    const oldFetch = global.fetch;
    const mockFetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 503 } as any);
    (global as any).fetch = mockFetch;
    process.env.TREFLE_API_TOKEN = 'token';

    const req = new Request('http://localhost/api/species-search?q=ficus');
    const res = await GET(req as any);
    const json = await res.json();

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json.some((s: any) => s.species.toLowerCase().includes('ficus'))).toBe(
      true
    );

    delete process.env.TREFLE_API_TOKEN;
    (global as any).fetch = oldFetch;
  });
});
