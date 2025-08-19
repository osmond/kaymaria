import { clampValue } from './Stepper';

describe('clampValue', () => {
  it('enforces minimum for days', () => {
    expect(clampValue(0, 1, 1)).toBe(1);
  });
  it('clamps ml to minimum', () => {
    expect(clampValue(5, 10, 10)).toBe(10);
  });
  it('rounds to step', () => {
    expect(clampValue(25, 10, 10)).toBe(30);
  });
});
