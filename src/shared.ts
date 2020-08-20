import * as util from 'util';
export const jenktronDebug = 'jenktronDebug';
export type VoidFn = () => void;

export function range(num: number): number[] {
  return [...Array(num).keys()];
}

export function match(re: RegExp, str: string): string {
  return re.test(str) ? str.match(re)[1] : '';
}

export function toMin(durationMillis: number): string {
  return (durationMillis / 1000 / 60).toFixed(1);
}

export function detectFailures(log: string): string[] {
  const failures = log?.match(/Failing scenarios.*[\s\S]*features\/.*/gm);
  return failures === null || failures === undefined
    ? ['No failing acc tests']
    : failures;
}

export function noop(): void {
  return;
}

export function wipe(node: { innerHTML: string }): void {
  node.innerHTML = '';
}

export function dasher(str: string): string {
  return str === null || str === undefined || str === '' ? '--' : str;
}

export function debugLog(o: any): void {
  if (window[jenktronDebug] === true) {
    console.warn(o);
  }
}

export function loggify(anything: unknown): string {
  return util.inspect(anything, false, null, true);
}

export function print(...args: unknown[]): void {
  console.log(...args);
}

const compareValues = (a, b): number => {
  if (a && b) {
    return a > b ? 1 : a === b ? 0 : -1;
  } else {
    return a ? 1 : b ? -1 : 0;
  }
};

export const createSortFn = (
  prepFn: (item: any) => number | string | boolean | Date
) => {
  return (_a: any, _b: any) => {
    const a = prepFn(_a);
    const b = prepFn(_b);
    return compareValues(a, b);
  };
};
