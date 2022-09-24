import { describe, test } from '@jest/globals';
import { ServerTiming } from '../lib/server-timing.js';

describe('ServerTiming', () => {
  test('Basic', async () => {
    const t = new ServerTiming();

    t.inc('test', 10);

    t.inc('test', 100).inc('test', 100.333).inc('test2', 100.444);

    t.inc('test', -33);

    t.meta('test', {
      desc: 'Just a test metric',
    });

    t.inc('test', undefined);

    expect(t.toHttpHeader()).toMatch(
      /^test;desc="Just a test metric";dur=177.33, test2;dur=100/,
    );

    expect(t.stats).toMatchInlineSnapshot(`
      {
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
