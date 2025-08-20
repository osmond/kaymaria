/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import type { AddPlantFormData } from '@/components/forms/AddPlantForm';
import NewPlantPage from '../page';

const push = jest.fn();
const refresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

let submitHandler: ((data: AddPlantFormData) => void | Promise<void>) | undefined;

jest.mock('@/components/forms/AddPlantForm', () => ({
  __esModule: true,
  default: (props: any) => {
    submitHandler = props.onSubmit;
    return <form aria-label="plant-form" />;
  },
}));

describe('NewPlantPage', () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    (global.fetch as any) = jest.fn();
  });

  it('renders heading and plant form', () => {
    render(<NewPlantPage />);
    expect(
      screen.getByRole('heading', { name: /add plant/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('plant-form')).toBeInTheDocument();
  });

  it('posts form data and navigates on success', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123' }),
    });

    render(<NewPlantPage />);
    await submitHandler!({
      name: 'Fern',
      roomId: 'living',
      light: 'medium',
      waterInterval: '5',
    });

    expect(fetch).toHaveBeenCalledWith('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fern',
        roomId: 'living',
        lightLevel: 'medium',
        plan: [{ type: 'water', intervalDays: 5 }],
      }),
    });
    expect(push).toHaveBeenCalledWith('/app/plants/123/created');
    expect(refresh).toHaveBeenCalled();
  });
});

