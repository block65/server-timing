import { describe, test } from '@jest/globals';
import { ServerTiming } from '../lib/server-timing.js';

describe('ServerTiming', () => {
  test('Basic', async () => {
    const timing = new ServerTiming();

    timing.inc('test', 10);

    timing.inc('test', 100).inc('test', 100.333).inc('test2', 100.444);

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

    expect(timing.toHttpHeader()).toMatch(
      /^test;desc="Just a test metric";dur=177.33, test2;dur=100/,
    );

    expect(timing.stats).toMatchInlineSnapshot(`
      {
        "marktest": {
          "dur": 1000.4059839993715,
          "metrics": [
            1000.4059839993715,
          ],
        },
        "test": {
          "desc": "Just a test metric",
          "dur": 177.333,
          "metrics": [
            10,
            100,
            100.333,
            -33,
          ],
        },
        "test2": {
          "dur": 100.444,
          "metrics": [
            100.444,
          ],
        },
      }
    `);
  });
});
