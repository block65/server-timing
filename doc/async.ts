import { createServerTimingContext } from '@block65/server-timing';

// first create a context for server timing
const timing = createServerTimingContext();

async function doSomeAsyncStuff() {
  const measure = timing.try((t) => t.mark('asyncstuff'));

  return new Promise((resolve) => {
    setTimeout(() => resolve('some random value'), 1000);
  }).then(measure);
}

await timing.run(async () => {
  await doSomeAsyncStuff();
  console.log(timing.try((t) => t.toString()));
  // -> asyncstuff:dur=1002.39
});
