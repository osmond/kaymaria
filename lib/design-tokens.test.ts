/**
 * @jest-environment node
 */
import { lightTokens, darkTokens } from './design-tokens';

describe('design tokens', () => {
  it('matches light token snapshot', () => {
    expect(lightTokens).toMatchSnapshot();
  });
  it('matches dark token snapshot', () => {
    expect(darkTokens).toMatchSnapshot();
  });
});
