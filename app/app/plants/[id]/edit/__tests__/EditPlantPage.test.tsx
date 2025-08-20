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
      waterAmountMl: 500,
      fertIntervalDays: 60,
      lastWateredAt: '2024-01-01',
      lastFertilizedAt: '2024-01-02',
      latitude: 1.23,
      longitude: 4.56,
    };
    render(<EditPlantPage plant={plant} />);
    expect(
      screen.getByRole('heading', { level: 1, name: /edit plant/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('Fern');
  });

  it('submits edited plant and navigates', async () => {
    const plant: any = {
      id: '1',
      name: 'Fern',
      roomId: 'living',
      lightLevel: 'medium',
      waterIntervalDays: 5,
      waterAmountMl: 500,
      fertIntervalDays: 60,
      lastWateredAt: '2024-01-01',
      lastFertilizedAt: '2024-01-02',
      latitude: 1.23,
      longitude: 4.56,
    };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const user = userEvent.setup();
    render(<EditPlantPage plant={plant} />);

    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), 'Snake Plant');
    await user.selectOptions(screen.getByLabelText(/room/i), 'bedroom');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.selectOptions(screen.getByLabelText(/light/i), 'low');
    await user.clear(screen.getByLabelText(/latitude/i));
    await user.type(screen.getByLabelText(/latitude/i), '9.87');
    await user.clear(screen.getByLabelText(/longitude/i));
    await user.type(screen.getByLabelText(/longitude/i), '65.43');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.clear(screen.getByLabelText(/water every/i));
    await user.type(screen.getByLabelText(/water every/i), '10');
    await user.clear(screen.getByLabelText(/water amount/i));
    await user.type(screen.getByLabelText(/water amount/i), '700');
    await user.clear(screen.getByLabelText(/fertilize every/i));
    await user.type(screen.getByLabelText(/fertilize every/i), '40');
    await user.clear(screen.getByLabelText(/last watered/i));
    await user.type(screen.getByLabelText(/last watered/i), '2024-01-03');
    await user.clear(screen.getByLabelText(/last fertilized/i));
    await user.type(screen.getByLabelText(/last fertilized/i), '2024-01-04');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(fetch).toHaveBeenCalledWith('/api/plants/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Snake Plant',
        roomId: 'bedroom',
        lightLevel: 'low',
        lat: 9.87,
        lon: 65.43,
        lastWateredAt: '2024-01-03T00:00:00.000Z',
        lastFertilizedAt: '2024-01-04T00:00:00.000Z',
        plan: [
          { type: 'water', intervalDays: 10, amountMl: 700 },
          { type: 'fertilize', intervalDays: 40 },
        ],
      }),
    });
    expect(push).toHaveBeenCalledWith('/app/plants/1');
    expect(refresh).toHaveBeenCalled();
  });
});

