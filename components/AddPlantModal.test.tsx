/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AddPlantModal from './AddPlantModal';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/fetchJson', () => ({
  fetchJson: jest.fn().mockResolvedValue({}),
  FetchJsonError: class extends Error {},
}));

jest.mock('./useCareTips', () => ({
  __esModule: true,
  default: () => ({}),
}));

// Mock fetch for RoomSelector and other network calls
beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  }) as any;
});

afterAll(() => {
  (global.fetch as any).mockRestore?.();
});

describe('AddPlantModal', () => {
  it('renders the Basics step when open', async () => {
    render(
      <AddPlantModal
        open={true}
        onOpenChange={() => {}}
        defaultRoomId="room-1"
        onCreate={() => {}}
      />
    );
    // heading for first step should appear
    expect(await screen.findByText('Basics')).toBeInTheDocument();
  });
});

