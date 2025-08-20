/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditPlantPage from '../EditPlantPage';

const push = jest.fn();
const refresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

describe('EditPlantPage', () => {
  const rooms = [
    { id: 'living', name: 'Living Room' },
    { id: 'bedroom', name: 'Bedroom' },
  ];

  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    (global.fetch as any) = jest.fn();
  });

  it('renders heading and form', () => {
    const plant: any = {
      id: '1',
      name: 'Fern',
      roomId: 'living',
      lightLevel: 'medium',
      waterIntervalDays: 5,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => rooms,
    });
    render(<EditPlantPage plant={plant} />);
    expect(
      screen.getByRole('heading', { level: 1, name: /edit plant/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('Fern');
  });

});

