import { AsyncLocalStorage } from 'node:async_hooks';
import { ServerTiming } from '../lib/server-timing.js';

export interface AlsStore {
  timing: ServerTiming;
}

export function createServerTimingContext() {
  const storage = new AsyncLocalStorage<AlsStore>();

  return {
    storage,
    run<R, A extends unknown[]>(fn: (...args: A) => R, ...args: A): R {
      return storage.run({ timing: new ServerTiming() }, () => fn(...args));
    },
    try: <T>(fn: (t: ServerTiming) => T): T => {
      const currentStore = storage.getStore();
      // `store.timing` might be undefined if this function is called without
      // a server timing storage context.
      //
      // Defaulting to a new instance of `ServerTiming` will give strange
      // results, but the alternative is to throw or do nothing.
      // Neither of which are better options
      return fn(currentStore?.timing || new ServerTiming());
    },
  };
}
