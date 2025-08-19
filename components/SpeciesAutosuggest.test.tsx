/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SpeciesAutosuggest from './SpeciesAutosuggest';

describe('SpeciesAutosuggest', () => {
  it('shows message when fetch fails', async () => {
    jest.useFakeTimers();
    const oldFetch = global.fetch;
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network'));

    render(
      <SpeciesAutosuggest value="" onChange={() => {}} onSelect={() => {}} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'abc' } });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      await screen.findByText('No suggestions right now. You can still proceed.')
    ).toBeInTheDocument();

    (global as any).fetch = oldFetch;
    jest.useRealTimers();
  });
});
