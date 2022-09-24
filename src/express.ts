import type { RequestHandler } from 'express';
import onHeaders from 'on-headers';
import type { TimingContext } from './create.js';

export function createServerTimingExpressMiddleware(
  timing: TimingContext,
): RequestHandler {
  return (_, res, next) => {
    const measure = timing.try((t) => t.mark('total'));

    timing.run(() => {
      onHeaders(res, function addServerTimingHeaders() {
        measure();
        this.setHeader(
          'Server-Timing',
          timing.try((t) => t.toHttpHeader()),
        );
      });

      next();
    });
  };
}
