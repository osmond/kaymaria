/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightsView from './InsightsView';

jest.mock('react-chartjs-2', () => ({ Line: () => null }));

describe('InsightsView', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-05-03'));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            period: '2024-05-01',
            newPlantCount: 1,
            completedTaskCount: 2,
            overdueTaskCount: 0,
          },
          {
            period: '2024-05-02',
            newPlantCount: 0,
            completedTaskCount: 1,
            overdueTaskCount: 1,
          },
          {
            period: '2024-05-03',
            newPlantCount: 0,
            completedTaskCount: 0,
            overdueTaskCount: 2,
          },
        ]),
    }) as any;
  });

  afterEach(() => {
    jest.useRealTimers();
    (global.fetch as jest.Mock).mockReset();
  });

  it('shows totals for metrics', async () => {
    render(<InsightsView />);
    const completed = await screen.findByText(/Completed Tasks/i);
    expect(within(completed.parentElement!).getByText('3')).toBeInTheDocument();
    const overdue = screen.getByText(/Overdue Tasks/i);
    expect(within(overdue.parentElement!).getByText('3')).toBeInTheDocument();
    const plants = screen.getByText(/New Plants/i);
    expect(within(plants.parentElement!).getByText('1')).toBeInTheDocument();
  });

  it('fetches default range', async () => {
    render(<InsightsView />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('start=2024-04-27');
    expect(url).toContain('end=2024-05-03');
  });

  it('fetches custom range', async () => {
    render(<InsightsView />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    (global.fetch as jest.Mock).mockClear();

    const startInput = (await screen.findByLabelText(/Start/i)) as HTMLInputElement;
    const endInput = (await screen.findByLabelText(/End/i)) as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2024-05-01' } });
    fireEvent.change(endInput, { target: { value: '2024-05-02' } });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = (global.fetch as jest.Mock).mock.calls.slice(-1)[0][0];
    expect(url).toContain('start=2024-05-01');
    expect(url).toContain('end=2024-05-02');
  });

  it('shows skeleton before data loads', async () => {
    let resolveFetch: any;
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<InsightsView />);

    expect(screen.getByTestId('insights-skeleton')).toBeInTheDocument();

    resolveFetch({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            period: '2024-05-01',
            newPlantCount: 1,
            completedTaskCount: 2,
            overdueTaskCount: 0,
          },
        ]),
    });

    await screen.findByText(/Completed Tasks/i);
    await waitFor(() =>
      expect(screen.queryByTestId('insights-skeleton')).not.toBeInTheDocument()
    );
  });
});
