/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightsView from '../InsightsView';

let lineProps: any;
jest.mock('react-chartjs-2', () => ({
  Line: (props: any) => {
    lineProps = props;
    return null;
  },
}));

describe('InsightsView', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-05-03'));
    lineProps = null;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders cards and chart data on success', async () => {
    const mockData = [
      { period: '2024-05-01', newPlantCount: 1, completedTaskCount: 2, overdueTaskCount: 0 },
      { period: '2024-05-02', newPlantCount: 0, completedTaskCount: 1, overdueTaskCount: 1 },
      { period: '2024-05-03', newPlantCount: 0, completedTaskCount: 0, overdueTaskCount: 2 },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<InsightsView />);

    const completed = await screen.findByText(/Completed Tasks/i);
    expect(within(completed.parentElement!).getByText('3')).toBeInTheDocument();
    const overdue = screen.getByText(/Overdue Tasks/i);
    expect(within(overdue.parentElement!).getByText('3')).toBeInTheDocument();
    const plants = screen.getByText(/New Plants/i);
    expect(within(plants.parentElement!).getByText('1')).toBeInTheDocument();

    expect(lineProps.data.labels).toEqual([
      '2024-05-01',
      '2024-05-02',
      '2024-05-03',
    ]);
    expect(lineProps.data.datasets[0].data).toEqual([2, 1, 0]);
    expect(lineProps.data.datasets[1].data).toEqual([0, 1, 2]);
    expect(lineProps.data.datasets[2].data).toEqual([1, 0, 0]);
  });

  it('renders empty state when API returns no data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<InsightsView />);

    const completed = await screen.findByText(/Completed Tasks/i);
    expect(within(completed.parentElement!).getByText('0')).toBeInTheDocument();
    const overdue = screen.getByText(/Overdue Tasks/i);
    expect(within(overdue.parentElement!).getByText('0')).toBeInTheDocument();
    const plants = screen.getByText(/New Plants/i);
    expect(within(plants.parentElement!).getByText('0')).toBeInTheDocument();

    expect(lineProps.data.labels).toEqual([]);
    expect(lineProps.data.datasets.every((ds: any) => ds.data.length === 0)).toBe(true);
  });

  it('shows error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    render(<InsightsView />);

    expect(await screen.findByText('HTTP 500')).toBeInTheDocument();
    expect(screen.queryByTestId('insights-skeleton')).not.toBeInTheDocument();
  });

  it('shows and hides loading skeleton', async () => {
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
      json: () => Promise.resolve([]),
    });

    await waitFor(() =>
      expect(screen.queryByTestId('insights-skeleton')).not.toBeInTheDocument()
    );
  });
});
