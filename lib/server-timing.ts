import { performance } from 'node:perf_hooks';

type Metric = number;

interface Meta {
  desc?: string; 
}

function sum(prev: Metric, curr: Metric): Metric {
  return prev + curr;
}

export class ServerTiming {
  #stats = new Map<string, Metric[]>();

  #meta = new Map<string, Meta>();

  public meta(name: string, meta: Meta) {
    this.#meta.set(name, meta);
  }

  public inc(name: string, value: Metric | undefined) {
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
    const startMs = performance.now();
    return () => {
      this.inc(name, performance.now() - startMs);
    };
  }

  public toHttpHeader(): string {
    return [...this.#stats.entries()]
      .map(([k, v]) => `${k};dur=${v.reduce(sum, 0).toFixed(2)}`)
      .join(', ');
  }

  public toString(): string {
    return [...this.#stats.entries()]
      .map(([k, v]) => `${k};dur=${v.reduce(sum, 0).toFixed(2)}`)
      .join(', ');
  }
}
