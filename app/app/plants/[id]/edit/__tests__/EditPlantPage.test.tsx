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
    await user.type(screen.getByLabelText(/latitude/i), '10');
    await user.type(screen.getByLabelText(/longitude/i), '20');
    await user.click(screen.getByRole('button', { name: /next/i }));

    const waterInput = screen.getByLabelText(/water every/i);
    await user.clear(waterInput);
    await user.type(waterInput, '10');
    const waterAmount = screen.getByLabelText(/water amount/i);
    await user.clear(waterAmount);
    await user.type(waterAmount, '400');
    const fertInput = screen.getByLabelText(/fertilize every/i);
    await user.clear(fertInput);
    await user.type(fertInput, '45');
    await user.type(screen.getByLabelText(/last watered/i), '2024-03-01');
    await user.type(
      screen.getByLabelText(/last fertilized/i),
      '2024-03-10'
    );
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(fetch).toHaveBeenCalledWith('/api/plants/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Snake Plant',
        roomId: 'bedroom',
        lightLevel: 'low',
        lat: 10,
        lon: 20,
        lastWateredAt: '2024-03-01T00:00:00.000Z',
        lastFertilizedAt: '2024-03-10T00:00:00.000Z',
        plan: [
          { type: 'water', intervalDays: 10, amountMl: 400 },
          { type: 'fertilize', intervalDays: 45 },
        ],
      }),
    });
    expect(push).toHaveBeenCalledWith('/app/plants/1');
    expect(refresh).toHaveBeenCalled();
  });
});

