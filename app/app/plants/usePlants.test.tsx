/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import usePlants from './usePlants';

describe('usePlants', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns data on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Fern' }],
    });
    const { result } = renderHook(() => usePlants());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.plants).toEqual([{ id: '1', name: 'Fern' }]);
    expect(result.current.error).toBeNull();
  });

  it('indicates loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => usePlants());
    expect(result.current.plants).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('returns error state', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });
    const { result } = renderHook(() => usePlants());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.plants).toBeNull();
    expect(result.current.error).toBe('HTTP 500');
  });
});
