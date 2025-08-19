/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PlantsView from '../PlantsView';

jest.mock('../usePlants');
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
const mockUsePlants = require('../usePlants').default as jest.Mock;

describe('PlantsView', () => {
  it('shows skeleton while loading', () => {
    mockUsePlants.mockReturnValue({ plants: null, error: null, isLoading: true });
    render(<PlantsView />);
    expect(screen.getByTestId('plants-skeleton')).toBeInTheDocument();
  });

  it('shows plants when loaded', () => {
    mockUsePlants.mockReturnValue({
      plants: [{ id: '1', name: 'Fern', room: 'Living' }],
      error: null,
      isLoading: false,
    });
    render(<PlantsView />);
    expect(screen.queryByTestId('plants-skeleton')).toBeNull();
    expect(screen.getByText('Fern')).toBeInTheDocument();
  });

  it('shows empty state when no plants', () => {
    mockUsePlants.mockReturnValue({ plants: [], error: null, isLoading: false });
    render(<PlantsView />);
    expect(
      screen.getByText('No plants yet. Add your first to start tending 🌿')
    ).toBeInTheDocument();
  });
});
