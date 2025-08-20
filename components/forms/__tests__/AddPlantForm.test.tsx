/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPlantForm from '../AddPlantForm';

describe('AddPlantForm', () => {
  const rooms = [
    { id: 'living', name: 'Living Room' },
    { id: 'bedroom', name: 'Bedroom' },
  ];

  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => rooms,
    }) as any;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('navigates through steps and submits data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={handleSubmit} />);

    // Identify
    await user.type(screen.getByLabelText(/name/i), 'Ficus');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Place
    await screen.findByRole('option', { name: 'Living Room' });
    await user.selectOptions(screen.getByLabelText(/room/i), 'living');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Describe
    await user.type(screen.getByLabelText(/pot size/i), '10 in');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Care Plan
    const waterInput = screen.getByLabelText(/water every/i);
    await user.clear(waterInput);
    await user.type(waterInput, '5');
    const waterAmountInput = screen.getByLabelText(/water amount/i);
    await user.clear(waterAmountInput);
    await user.type(waterAmountInput, '300');
    const fertEveryInput = screen.getByLabelText(/fertilize every/i);
    await user.clear(fertEveryInput);
    await user.type(fertEveryInput, '60');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Confirm
    await screen.findByRole('button', { name: /add plant/i });
    await user.click(screen.getByRole('button', { name: /add plant/i }));
    await waitFor(() => screen.getByText(/water every/i));
  });

  it('shows errors for required fields', async () => {
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/enter a plant name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), 'Fern');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/choose a room or add one/i)).toBeInTheDocument();
  });
});

