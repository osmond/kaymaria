/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import NewPlantPage from '../new/page';

jest.mock('@/components/PlantForm', () => ({ __esModule: true, default: () => <div>PlantForm</div> }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));

describe('NewPlantPage', () => {
  it('renders heading and form', () => {
    render(<NewPlantPage />);
    expect(screen.getByRole('heading', { level: 1, name: /add plant/i })).toBeInTheDocument();
    expect(screen.getByText('PlantForm')).toBeInTheDocument();
  });
});
