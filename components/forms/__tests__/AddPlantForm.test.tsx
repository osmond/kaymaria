/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPlantForm from '../AddPlantForm';

const mockRooms = [
  { id: 'living', name: 'Living Room' },
  { id: 'bedroom', name: 'Bedroom' },
];

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockRooms),
  } as any);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('AddPlantForm', () => {
  it('navigates between steps and submits data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<AddPlantForm onSubmit={handleSubmit} />);

    // Basics step
    await screen.findByRole('option', { name: 'Living Room' });
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
      waterInterval: 5,
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
          waterInterval: 10,
        }}
        submitLabel="Save"
      />
    );
    await screen.findByRole('option', { name: 'Bedroom' });
    expect(screen.getByLabelText(/name/i)).toHaveValue('Fern');
    expect(screen.getByLabelText(/room/i)).toHaveValue('bedroom');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('loads rooms from API', async () => {
    render(<AddPlantForm onSubmit={jest.fn()} />);
    expect(await screen.findByRole('option', { name: 'Living Room' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Bedroom' })).toBeInTheDocument();
  });
});
