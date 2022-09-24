/// <reference lib="dom" />
import express from 'express';
import { createServerTimingContext } from '@block65/server-timing';
import { createServerTimingExpressMiddleware } from '@block65/server-timing/express';

async function doSomeAsyncStuff() {
  const measure = timing.try((t) => t.mark('asyncstuff'));

  return new Promise((resolve) => {
    setTimeout(() => resolve('some random value'), 1000);
  }).then(measure);
}

// Create a timing context
const timing = createServerTimingContext();
const middleware = createServerTimingExpressMiddleware(timing);

// express v5 example with async route handler
const server = express()
  .use(middleware)
  .get('/', async (_, res) => {
    const someRandomValue = await doSomeAsyncStuff();
    res.send(someRandomValue);
  })
  .listen(3000);

console.log(
  await fetch('http://localhost:3000').then((res) =>
    res.headers.get('Server-Timing'),
  ),
);
// -> asyncstuff;dur=1002.11, total;dur=1003.44

server.close();
