import { describe, test } from '@jest/globals';
import express from 'express';
import getPort from 'get-port';
import { createServerTimingContext } from '../src/create.js';
import { createServerTimingExpressMiddleware } from '../src/express.js';

describe('Express', () => {
  const timing = createServerTimingContext();

  test('Middleware', async () => {
    const app = express();
    app.use(createServerTimingExpressMiddleware(timing));

    app.use((_, res) => {
      timing.try((t) => t.inc('test', 100));
      timing.try((t) => t.inc('test2', 100.0));
      timing.try((t) => t.inc('test3', 0));

      res.send('OK!');
    });

    const port = await getPort();
    const server = app.listen(port, 'localhost');

    // run it once to prove the metrics
    await expect(
      fetch(`http://localhost:${port}`).then((res) =>
        res.headers.get('Server-Timing'),
      ),
    ).resolves.toMatchInlineSnapshot(`"test;dur=100, test2;dur=100, test3"`);

    // run it again to prove the independent store
    // await expect(
    //   fetch(`http://localhost:${port}`).then((res) =>
    //     res.headers.get('Server-Timing'),
    //   ),
    // ).resolves.toMatchInlineSnapshot(`"test;dur=100, test2;dur=100"`);

    server.close();
  });
});
