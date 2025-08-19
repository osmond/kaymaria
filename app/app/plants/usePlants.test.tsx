/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePlants from './usePlants';
import useSWR from 'swr';

jest.mock('swr');
const mockUseSWR = useSWR as unknown as jest.Mock;

describe('usePlants', () => {
  it('returns data on success', () => {
    mockUseSWR.mockReturnValue({
      data: [{ id: '1', name: 'Fern' }],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });
    const { result } = renderHook(() => usePlants());
    expect(result.current.plants).toEqual([{ id: '1', name: 'Fern' }]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('indicates loading state', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });
    const { result } = renderHook(() => usePlants());
    expect(result.current.plants).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('returns error state', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('failed'),
      isLoading: false,
      mutate: jest.fn(),
    });
    const { result } = renderHook(() => usePlants());
    expect(result.current.plants).toBeNull();
    expect(result.current.error).toBe('failed');
    expect(result.current.isLoading).toBe(false);
  });
});
