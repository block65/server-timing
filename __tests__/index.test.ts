import { describe, test } from '@jest/globals';
import { createServerTimingContext } from '../src/create.js';

describe('Basic', () => {
  test('expect withServerTiming to still work outside of context', async () => {
    const timing = createServerTimingContext();
    expect(timing.try((t) => t.toString())).toEqual('');

    await expect(timing.try(async (t) => t.toString())).resolves.toEqual('');
  });

  test('generic async usage', async () => {
    const timing = createServerTimingContext();

    // expect.assertions(2);

    const result = await timing.run(async () => {
      timing.try((t) => t.inc('random', 10));

      const someRandomValue = await timing.try(async (t) => {
        t.meta('random', { desc: 'really just random' });
        return 'some random value';
      });

      const measure = timing.try((t) => t.mark('test2'));
      measure();

      expect(timing.try((t) => t.toString())).toMatchInlineSnapshot(
        `"random:dur=10,desc="really just random"; test2:dur=0.02"`,
      );

      return someRandomValue;
    });

    expect(result).toBe('some random value');
  });
});
