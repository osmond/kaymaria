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
    await user.type(screen.getByLabelText(/latitude/i), '12.34');
    await user.type(screen.getByLabelText(/longitude/i), '56.78');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Care step
    await user.clear(screen.getByLabelText(/water every/i));
    await user.type(screen.getByLabelText(/water every/i), '5');
    await user.clear(screen.getByLabelText(/water amount/i));
    await user.type(screen.getByLabelText(/water amount/i), '600');
    await user.clear(screen.getByLabelText(/fertilize every/i));
    await user.type(screen.getByLabelText(/fertilize every/i), '30');
    await user.type(screen.getByLabelText(/last watered/i), '2024-01-01');
    await user.type(screen.getByLabelText(/last fertilized/i), '2024-01-02');
    await user.click(screen.getByRole('button', { name: /add plant/i }));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit.mock.calls[0][0]).toEqual({
      name: 'Ficus',
      roomId: 'living',
      light: 'medium',
      lat: 12.34,
      lon: 56.78,
      waterEvery: 5,
      waterAmount: 600,
      fertEvery: 30,
      lastWatered: '2024-01-01',
      lastFertilized: '2024-01-02',
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
          lat: 1.23,
          lon: 4.56,
          waterEvery: 10,
          waterAmount: 500,
          fertEvery: 60,
          lastWatered: '2024-01-01',
          lastFertilized: '2024-01-02',
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
});
