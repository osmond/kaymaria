/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import NewPlantPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/components/forms/AddPlantForm', () => ({
  __esModule: true,
  default: () => <form aria-label="plant-form" />,
}));

describe('NewPlantPage', () => {
  it('renders heading and plant form', () => {
    render(<NewPlantPage />);
    expect(
      screen.getByRole('heading', { name: /add plant/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('plant-form')).toBeInTheDocument();
  });
});

