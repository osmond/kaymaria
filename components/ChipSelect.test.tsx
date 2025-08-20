/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ChipSelect } from './ChipSelect';

describe('ChipSelect', () => {
  it('allows arrow key navigation and selection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <ChipSelect options={['A', 'B', 'C']} value="A" onChange={onChange} />
    );
    const first = getByLabelText('A');
    first.focus();
    await user.keyboard('{ArrowRight}');
    const second = getByLabelText('B');
    expect(document.activeElement).toBe(second);
    await user.keyboard('{Space}');
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('only selected chip is tabbable', () => {
    const { getByLabelText } = render(
      <ChipSelect options={['A', 'B']} value="A" onChange={() => {}} />
    );
    const first = getByLabelText('A');
    const second = getByLabelText('B');
    expect(first).toHaveAttribute('tabindex', '0');
    expect(second).toHaveAttribute('tabindex', '-1');
  });
});
