/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
  it('navigates between steps and submits data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={handleSubmit} />);

     expect(await screen.findByRole('option', { name: 'Living Room' })).toBeInTheDocument();
     expect(screen.getByRole('option', { name: 'Bedroom' })).toBeInTheDocument();

    // Basics step
    await user.type(screen.getByLabelText(/name/i), 'Ficus');
    await user.selectOptions(screen.getByLabelText(/room/i), 'living');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Environment step
    await user.selectOptions(screen.getByLabelText(/light/i), 'medium');
    await user.type(screen.getByLabelText(/latitude/i), '40.7');
    await user.type(screen.getByLabelText(/longitude/i), '-74');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Care step
    const waterInput = screen.getByLabelText(/water every/i);
    await user.clear(waterInput);
    await user.type(waterInput, '5');
    const waterAmountInput = screen.getByLabelText(/water amount/i);
    await user.clear(waterAmountInput);
    await user.type(waterAmountInput, '300');
    const fertEveryInput = screen.getByLabelText(/fertilize every/i);
    await user.clear(fertEveryInput);
    await user.type(fertEveryInput, '60');
    await user.type(screen.getByLabelText(/last watered/i), '2024-01-01');
    await user.type(
      screen.getByLabelText(/last fertilized/i),
      '2024-02-01'
    );
    await user.click(screen.getByRole('button', { name: /add plant/i }));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit.mock.calls[0][0]).toEqual({
      name: 'Ficus',
      roomId: 'living',
      light: 'medium',
      waterEvery: 5,
      waterAmount: 300,
      fertEvery: 60,
      lastWatered: '2024-01-01',
      lastFertilized: '2024-02-01',
      lat: 40.7,
      lon: -74,
    });
  });

  it('prefills initial values and uses custom submit label', async () => {
    const user = userEvent.setup();
    render(
      <AddPlantForm
        onSubmit={jest.fn()}
        initialValues={{
          name: 'Fern',
          roomId: 'bedroom',
          light: 'low',
          waterEvery: 10,
          waterAmount: 250,
          fertEvery: 30,
          lastWatered: '',
          lastFertilized: '',
          lat: undefined,
          lon: undefined,
        }}
        submitLabel="Save"
      />
    );
    await screen.findByRole('option', { name: 'Bedroom' });
    expect(screen.getByLabelText(/name/i)).toHaveValue('Fern');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('shows errors on required basics fields', async () => {
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={jest.fn()} />);

    await screen.findByRole('option', { name: 'Living Room' });
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(await screen.findByText(/enter a plant name/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a room or add one/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /basics/i })).toBeInTheDocument();
  });

  it('blocks submit when care values invalid until corrected', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={handleSubmit} />);

    // pass basics and environment
    await screen.findByRole('option', { name: 'Living Room' });
    await user.type(screen.getByLabelText(/name/i), 'Ficus');
    await user.selectOptions(screen.getByLabelText(/room/i), 'living');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    const waterInput = screen.getByLabelText(/water every/i);
    await user.clear(waterInput);
    await user.type(waterInput, '0');
    await user.click(screen.getByRole('button', { name: /add plant/i }));

    expect(await screen.findByText(/must be at least 1 day/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    await user.clear(waterInput);
    await user.type(waterInput, '3');
    await user.click(screen.getByRole('button', { name: /add plant/i }));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('shows stepper progress and allows navigating back via stepper', async () => {
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={jest.fn()} />);
    // initial step highlighted
    expect(
      screen.getByRole('button', { name: 'Basics' })
    ).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: 'Environment' })).toBeDisabled();

    // fill basics and advance
    await screen.findByRole('option', { name: 'Living Room' });
    await user.type(screen.getByLabelText(/name/i), 'Ficus');
    await user.selectOptions(screen.getByLabelText(/room/i), 'living');
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(
      screen.getByRole('button', { name: 'Environment' })
    ).toHaveAttribute('aria-current', 'step');

    // go back using stepper
    await user.click(screen.getByRole('button', { name: 'Basics' }));
    expect(
      screen.getByRole('heading', { name: /basics/i })
    ).toBeInTheDocument();
  });

  it('disables next when no rooms and allows adding one', async () => {
    const user = userEvent.setup();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'office', name: 'Office' }),
      });
    global.fetch = fetchMock as any;

    render(<AddPlantForm onSubmit={jest.fn()} />);

    await screen.findByPlaceholderText(/add room/i);
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();

    await user.type(screen.getByLabelText(/name/i), 'Cactus');
    await user.type(screen.getByPlaceholderText(/add room/i), 'Office');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await screen.findByRole('option', { name: 'Office' });
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });
});
