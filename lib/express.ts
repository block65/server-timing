import type { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestHandler } from 'express';
import onHeaders from 'on-headers';
import type { AlsStore } from './create-store.js';
import { ServerTiming } from './server-timing.js';

export function createServerTimingMiddleware(
  storage: AsyncLocalStorage<AlsStore>
): RequestHandler {
  return (_, res, next) => {
    const timing = new ServerTiming();
    const measure = timing.mark('total');

    storage.run({ timing }, () => {
      onHeaders(res, function addServerTimingHeaders() {
        measure();
        this.setHeader('Server-Timing', timing.toHttpHeader());
      });

      next();
    });
  };
}
