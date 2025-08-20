/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EditPlantPage from '../EditPlantPage';

jest.mock('@/components/forms/AddPlantForm', () => ({
  __esModule: true,
  default: () => <div>AddPlantForm</div>,
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe('EditPlantPage', () => {
  it('renders heading and form', () => {
    const plant: any = { id: '1', name: 'Fern', roomId: 'living', lightLevel: 'medium', waterIntervalDays: 5 };
    render(<EditPlantPage plant={plant} />);
    expect(
      screen.getByRole('heading', { level: 1, name: /edit plant/i })
    ).toBeInTheDocument();
    expect(screen.getByText('AddPlantForm')).toBeInTheDocument();
  });
});
