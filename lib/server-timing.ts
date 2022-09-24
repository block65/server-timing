import { performance } from 'node:perf_hooks';

type Metric = number;

interface Meta {
  desc?: string;
}

function sum(prev: Metric, curr: Metric): Metric {
  return prev + curr;
}

export class ServerTiming {
  readonly #stats = new Map<string, Metric[]>();

  readonly #meta = new Map<string, Meta>();

  public meta(name: string, meta: Meta) {
    this.#meta.set(name, meta);
  }

  public inc(name: string, value: Metric | undefined) {
    // we support undefined values as a nice DX improvement,
    // in the case you pass a direct value that might be `undefined`
    // It just saves an "if" wrapper in the calling code
    if (!value) {
      return this;
    }
    const stat = this.#stats.get(name);
    if (stat) {
      stat.push(value);
    } else {
      this.#stats.set(name, [value]);
    }
    return this;
  }

  public mark(name: string) {
    const mark = performance.mark(name);

    // we pass through any single argument so it can be used
    // as a promise thenable `.then(measure)`
    return (value?: unknown) => {
      const measure = performance.measure(`${name} to now`, mark.name);
      this.inc(name, measure.duration);
      return value;
    };
  }

  private get statsEntries() {
    return [...this.#stats.entries()].map(
      ([name, metrics]: [string, Metric[]]): [
        string,
        { dur: number; desc?: string; metrics: Metric[] },
      ] => {
        const desc = this.#meta.get(name)?.desc;

        return [
          name,
          {
            dur: metrics.reduce(sum, 0),
            metrics,
            ...(desc && { desc }),
          },
        ];
      },
    );
  }

  public get stats() {
    return Object.fromEntries(this.statsEntries);
  }

  public toHttpHeader(): string {
    return this.statsEntries
      .map(([name, { dur, desc }]) =>
        [
          name,
          ...(desc ? [`desc="${desc}"`] : []),
          ...(dur > 0 ? [`dur=${dur.toFixed(2).replace(/\.?0+$/, '')}`] : []),
        ].join(';'),
      )
      .join(', ');
  }

  public toString(): string {
    return this.statsEntries
      .map(
        ([name, { dur, desc }]) =>
          `${name}:${[
            `dur=${dur.toFixed(2).replace(/\.?0+$/, '')}`,
            ...(desc ? [`desc="${desc}"`] : []),
          ].join(',')}`,
      )
      .join('; ');
  }
}
