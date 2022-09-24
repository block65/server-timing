import { describe, test } from '@jest/globals';
import { createServerTimingContext } from '../src/create.js';

const promiseWait = async (ms = 1000) => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

describe('Basic', () => {
  test('expect withServerTiming to still work outside of context', async () => {
    const { try: withServerTiming } = createServerTimingContext();
    expect(withServerTiming((t) => t.toString())).toEqual('');

    await expect(withServerTiming(async (t) => t.toString())).resolves.toEqual(
      '',
    );
  });

  test('generic async usage', async () => {
    const timing = createServerTimingContext();

    const result = await timing.run(async () => {
      timing.try((t) => t.inc('random', 10));

      const someRandomValue = await timing.try(async (t) => {
        await promiseWait(1000);
        t.inc('random', 1);
        return 'some random value';
      });

      const measure = timing.try((t) => t.mark('test2'));
      await promiseWait(1000);
      measure();

      return someRandomValue;
    });

    expect(result).toBe('some random value');
  });
});
