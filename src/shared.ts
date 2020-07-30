import * as util from 'util';

export function range(num: number): number[] {
  return [...Array(num).keys()];
}

export function match(re: RegExp, str: string): string {
  return re.test(str) ? str.match(re)[1] : '';
}

export function loggify(anything: unknown): string {
  return util.inspect(anything, false, null, true);
}

export function print(...args: unknown[]): void {
  console.log(...args);
}

export function toMin(durationMillis: number): string {
  return (durationMillis / 1000 / 60).toFixed(1);
}

export function detectFailures(log: string): string[] {
  const failures = log.match(/Failing scenarios.*[\s\S]*features\/.*/gm);
  return failures === null ? ['No failing acc tests'] : failures;
}

export function noop(): void {
  return;
}

export function wipe(node: { innerHTML: string }): void {
  node.innerHTML = '';
}
