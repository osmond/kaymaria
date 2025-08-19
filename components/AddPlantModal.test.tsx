/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPlantModal from './AddPlantModal';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('./useCareTips', () => jest.fn(() => ({})));

jest.mock('@/lib/fetchJson', () => ({
  fetchJson: jest.fn(),
}));

describe('AddPlantModal', () => {
  beforeEach(() => {
    push.mockReset();
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url === '/api/rooms') {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 'room-1', name: 'Living Room' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    }) as any;
    const { fetchJson } = require('@/lib/fetchJson');
    (fetchJson as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith('/api/plants?')) {
        return Promise.resolve([]);
      }
      if (url === '/api/plants') {
        return Promise.resolve({ id: 'p1', name: 'Fern' });
      }
      return Promise.resolve(null);
    });
  });

  it('allows adding a plant', async () => {
    const onCreate = jest.fn();
    render(
      <AddPlantModal
        open={true}
        onOpenChange={() => {}}
        defaultRoomId="room-1"
        onCreate={onCreate}
      />
    );

    const nameInput = await screen.findByPlaceholderText('e.g., Monstera deliciosa');
    fireEvent.change(nameInput, { target: { value: 'Fern' } });

    for (let i = 0; i < 3; i++) {
      const next = screen.getByRole('button', { name: /next/i });
      fireEvent.click(next);
    }

    const confirm = screen.getByRole('button', { name: /confirm plan/i });
    fireEvent.click(confirm);

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ id: 'p1', name: 'Fern' }));
    expect(push).toHaveBeenCalledWith('/app/plants/p1/created');
  });
});
