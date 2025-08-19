/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeciesAutosuggest from './SpeciesAutosuggest';

describe('SpeciesAutosuggest', () => {
  it('ignores out-of-order responses', async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;

    let resolveFirst: (v: any) => void;
    let resolveSecond: (v: any) => void;
    const firstPromise = new Promise((res) => { resolveFirst = res; });
    const secondPromise = new Promise((res) => { resolveSecond = res; });
    fetchMock
      .mockImplementationOnce(() => firstPromise as any)
      .mockImplementationOnce(() => secondPromise as any);

    const { getByRole, queryByText } = render(
      <SpeciesAutosuggest value="" onChange={() => {}} onSelect={() => {}} />,
    );

    const input = getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });
    jest.advanceTimersByTime(300);

    fireEvent.change(input, { target: { value: 'ab' } });
    jest.advanceTimersByTime(300);

    resolveSecond!({
      ok: true,
      json: async () => [{ name: 'B plant', species: 'b' }],
    } as any);
    await waitFor(() => expect(queryByText('B plant')).toBeInTheDocument());

    resolveFirst!({
      ok: true,
      json: async () => [{ name: 'A plant', species: 'a' }],
    } as any);
    await Promise.resolve();

    expect(queryByText('A plant')).toBeNull();

    (global as any).fetch = undefined;
  });
});
