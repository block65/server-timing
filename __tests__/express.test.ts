import { describe, test } from '@jest/globals';
import type { Request, Response } from 'express';
import { createServerTimingContext } from '../src/create.js';
import { createServerTimingExpressMiddleware } from '../src/express.js';

describe('Express', () => {
  test('Middleware', async () => {
    const timing = createServerTimingContext();

    const middleware = createServerTimingExpressMiddleware(timing);

    expect.assertions(2);

    await new Promise<void>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      middleware({} as Request, {} as Response, () => {
        timing.try((t) => t.inc('test', 100));
        timing.try((t) => t.inc('test2', 100.0));

        timing.try((t) => {
          expect(t.toHttpHeader()).toMatchInlineSnapshot(
            '"test;dur=100, test2;dur=100"',
          );
          expect(t.toString()).toMatchInlineSnapshot(
            // eslint-disable-next-line quotes
            `"test:dur=100; test2:dur=100"`,
          );
        });

        resolve();
      });
    });
  });
});
