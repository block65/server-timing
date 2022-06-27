import { describe, test } from '@jest/globals';
import { createTimingStore } from '../lib/create-store.js';
import { createServerTimingMiddleware } from '../lib/express.js';
import { ServerTiming } from '../lib/server-timing.js';

describe('Express', () => {
  test('Middleware', async () => {
    const { storage, withTiming } = createTimingStore();

    const middleware = createServerTimingMiddleware(storage);

    expect.assertions(2);

    await new Promise<void>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      middleware({} as any, {} as any, () => {
        withTiming((t) => t.inc('test', 100));
        withTiming((t) => t.inc('test2', 100));

        withTiming((t) => {
          expect(t.toHttpHeader()).toMatchInlineSnapshot(
            '"test;dur=100.00, test2;dur=100.00"'
          );
          expect(t.toString()).toMatchInlineSnapshot(
            '"test;dur=100.00, test2;dur=100.00"'
          );
        });

        resolve();
      });
    });
  });

  test('expect withTiming outside of async to throw', () => {
    const { withTiming } = createTimingStore();
    expect(withTiming).toThrowErrorMatchingInlineSnapshot('"No timing store"');
  });

  test('ServerTiming', async () => {
    const timing = new ServerTiming();

    timing.inc('test', 10);

    timing.inc('test', 100).inc('test', 100).inc('test2', 100);

    timing.inc('test', -33);

    timing.meta('test', {
      desc: 'Just a test metric',
    });

    timing.inc('test', undefined);

    const measure = timing.mark('marktest');

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    measure();

    expect(timing.toHttpHeader()).toMatchInlineSnapshot(
      '"test;dur=177.00, test2;dur=100.00, marktest;dur=1000.44"'
    );
    expect(timing.toString()).toMatchInlineSnapshot(
      '"test;dur=177.00, test2;dur=100.00, marktest;dur=1000.44"'
    );
  });
});
