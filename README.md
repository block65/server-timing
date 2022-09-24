# @block65/server-timing

From https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing

> The Server-Timing header communicates one or more metrics and descriptions for a given request-response cycle. It is used to surface any backend server timing metrics (e.g. database read/write, CPU time, file system access, etc.) in the developer tools in the user's browser or in the PerformanceServerTiming interface.

This library helps you track and log timing metrics during the request response cycles of your app

## Usage

## As Express middleware

This gives you a `total` mark as a HTTP header automatically

```typescript
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
```

### General Async

A convoluted example of how to run async functions and record timing metrics

```typescript
import { createServerTimingContext } from '@block65/server-timing';

// first create a context for server timing
const timing = createServerTimingContext();

async function doSomeAsyncStuff() {
  const measure = timing.try((t) => t.mark('asyncstuff'));

  return new Promise((resolve) => {
    setTimeout(() => resolve('some random value'), 1000);
  }).then(measure);
}

// server timing is usually used in a request-response cycle
// this is just a demo
await timing.run(async () => {
  await doSomeAsyncStuff();
  console.log(timing.try((t) => t.toString()));
  // -> asyncstuff:dur=1002.39
});
```

### `ServerTiming` class

An instance of the `ServerTiming` class is the first argument to `timing.try` and can be used standalone if desired

```typescript
import { ServerTiming } from '@block65/server-timing';

const t = new ServerTiming();

// increment the timing mark called `test`
t.inc('test', 10);

// chain increments for multiple marks
t.inc('test', 100).inc('test2', 100);

// decrement using negative values
t.inc('test', -33);

// set a description for the timing mark `test`
t.meta('test', {
  desc: 'Just a test metric',
});

const measure = t.mark('promise');

await new Promise((resolve) => {
  setTimeout(resolve, 1000);
}).then(measure);

console.log(t.toString());

// -> test:dur=77,desc="Just a test metric"; test2:dur=100; promise:dur=1001.71
```
