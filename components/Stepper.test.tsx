/**
 * @jest-environment jsdom
 */
import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Stepper from './Stepper';

describe('Stepper', () => {
  it('clamps to the minimum on blur', () => {
    function Wrapper() {
      const [v, setV] = useState('1');
      return <Stepper value={v} onChange={setV} min={1} />;
    }
    const { getByRole } = render(<Wrapper />);
    const input = getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);
    expect(input.value).toBe('1');
  });

  it('rounds to step multiples on blur', () => {
    function Wrapper() {
      const [v, setV] = useState('100');
      return <Stepper value={v} onChange={setV} min={10} step={10} />;
    }
    const { getByRole } = render(<Wrapper />);
    const input = getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);
    expect(input.value).toBe('120');
  });
});

