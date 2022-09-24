import type { RequestHandler } from 'express';
import onHeaders from 'on-headers';
import type { createServerTimingContext } from './create.js';

export function createServerTimingExpressMiddleware(
  context: ReturnType<typeof createServerTimingContext>,
): RequestHandler {
  return (_, res, next) => {
    const measure = context.try((t) => t.mark('total'));

    context.run(() => {
      onHeaders(res, function addServerTimingHeaders() {
        measure();
        this.setHeader(
          'Server-Timing',
          context.try((t) => t.toHttpHeader()),
        );
      });

      next();
    });
  };
}
