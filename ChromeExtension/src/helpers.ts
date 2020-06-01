/** fix urls that don't have http prefix */
// eslint-disable-next-line import/prefer-default-export
import remove from "ytech-js-extensions/lib/array/remove";
import addIfNotExists from "ytech-js-extensions/lib/array/addIfNotExists";

export function fixUrl(url: string): string {
  return url && url.replace(/^\/\//, "https://");
}

// function for preventing ugly fast-blinking during updating states
export function PromiseWait<T>(promiseFn: Promise<T>, ms = 400): T {
  // @ts-ignore
  return new Promise(resolve => {
    return setTimeout(() => resolve(promiseFn), ms);
  });
}

function update<T>(getterKey, newItem): T {
  const item = this.find(v => getterKey(v));
  Object.assign(item, newItem);
  return newItem;
}

export const arrayFunctions = { remove, addIfNotExists, update };

type Range = { min?: number; max?: number };
/** exclude 1 range from another range */
export function excludeRange(min: number | undefined, max: number | undefined, exMin: number, exMax: number): Range[] {
  const ranges: Range[] = [];

  if ((min || 0) < exMin) {
    ranges.push({ min, max: Math.min(exMin, max || exMin) });
  }

  if (max > exMax || max == null) {
    ranges.push({ min: Math.max(exMax, min || 0), max });
  }

  return ranges;
}
