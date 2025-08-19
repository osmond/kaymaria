/**
 * @jest-environment jsdom
 */
import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('supports tab order and arrow keys on buttons', async () => {
    function Wrapper() {
      const [v, setV] = useState('1');
      return <Stepper value={v} onChange={setV} ariaLabel="Quantity" />;
    }
    const { getByLabelText } = render(<Wrapper />);
    const user = userEvent.setup();
    await user.tab();
    expect(getByLabelText('Decrease value')).toHaveFocus();
    await user.tab();
    const input = getByLabelText('Quantity') as HTMLInputElement;
    expect(input).toHaveFocus();
    await user.tab();
    const inc = getByLabelText('Increase value');
    expect(inc).toHaveFocus();
    fireEvent.keyDown(inc, { key: 'ArrowUp' });
    expect(input.value).toBe('2');
  });
});

