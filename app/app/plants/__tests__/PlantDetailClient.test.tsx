/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PlantDetailClient from '../[id]/PlantDetailClient';

jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => <>{children}</> }));
const mockReplace = jest.fn();
var mockUseSearchParams: jest.Mock;
jest.mock('next/navigation', () => {
  mockUseSearchParams = jest.fn();
  return {
    useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
    useSearchParams: mockUseSearchParams,
  };
});
jest.mock('@/components/EditPlantModal', () => () => null);
jest.mock('@/components/BottomNav', () => () => null);
jest.mock('@/components/CareSummary', () => () => <div>CareSummary</div>);

describe('PlantDetailClient', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn((url: RequestInfo) => {
      const href = typeof url === 'string' ? url : url.toString();
      if (href.includes('/weather')) {
        return Promise.resolve({ ok: true, json: async () => ({ temperature: 20 }) }) as any;
      }
      return Promise.resolve({ ok: true, json: async () => [] }) as any;
    }) as any;
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockReplace.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('renders plant name', async () => {
    render(
      <PlantDetailClient
        plant={{ id: '1', userId: 'u1', name: 'Fern', species: 'Pteridophyta' } as any}
      />
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Fern' })).toBeInTheDocument()
    );
  });

  it('updates url when switching tabs', () => {
    render(
      <PlantDetailClient
        plant={{ id: '1', userId: 'u1', name: 'Fern', species: 'Pteridophyta' } as any}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notes' }));
    expect(mockReplace).toHaveBeenCalledWith('?tab=notes', { scroll: false });
  });
});

