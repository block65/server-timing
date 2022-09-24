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
