import { AsyncLocalStorage } from 'node:async_hooks';
import type { ServerTiming } from './server-timing.js';

export interface AlsStore {
  timing: ServerTiming;
}

export function createTimingStore() {
  const storage = new AsyncLocalStorage<AlsStore>();

  const withTiming = <T>(fn: (t: ServerTiming) => T): void => {
    const store = storage.getStore();
    if (store) {
      fn(store.timing);
    } else {
      throw new Error('No timing store');
    }
  };

  return { storage, withTiming };
}
