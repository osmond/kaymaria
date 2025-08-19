/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlantDetailClient from '../[id]/PlantDetailClient';

jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => <>{children}</> }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/app/plants/1',
}));
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

  it('closes menu when Escape is pressed', async () => {
    render(
      <PlantDetailClient
        plant={{ id: '1', userId: 'u1', name: 'Fern', species: 'Pteridophyta' } as any}
      />
    );

    const user = userEvent.setup();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'More options' }));
    expect(screen.getByText('Edit')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Edit')).not.toBeInTheDocument());
  });
});

