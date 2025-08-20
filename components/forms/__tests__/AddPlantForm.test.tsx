/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPlantForm from '../AddPlantForm';

describe('AddPlantForm', () => {
  it('navigates between steps and submits data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={handleSubmit} />);

    // Basics step
    await user.type(screen.getByLabelText(/name/i), 'Ficus');
    await user.selectOptions(screen.getByLabelText(/room/i), 'living');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Environment step
    await user.selectOptions(screen.getByLabelText(/light/i), 'medium');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Care step
    const waterInput = screen.getByLabelText(/water every/i);
    await user.clear(waterInput);
    await user.type(waterInput, '5');
    await user.click(screen.getByRole('button', { name: /add plant/i }));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit.mock.calls[0][0]).toEqual({
      name: 'Ficus',
      roomId: 'living',
      light: 'medium',
      waterEvery: 5,
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
        }}
        submitLabel="Save"
      />
    );
    expect(screen.getByLabelText(/name/i)).toHaveValue('Fern');
    expect(screen.getByLabelText(/room/i)).toHaveValue('bedroom');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('shows errors on required basics fields', async () => {
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={jest.fn()} />);

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
});
