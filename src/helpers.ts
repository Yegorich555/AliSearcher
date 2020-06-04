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

export const roundPrice = (num: number): number => Math.round(num * 100) / 100;

/**
 * parse float string including fix for decimal-thousand-separator
 *  format 1,326.23 and 1.326,23 to 1326.23
 * */
export const parseFloatUniv = (str: string | null, thousandSeparator?: "." | ","): number | null => {
  if (str === "" || str == null) {
    return null;
  }
  const s = str.replace(/\s/g, "");

  const result = s.split(/[,.]/g);
  // "5"
  if (result.length === 1) {
    return Number.parseFloat(result[0]);
  }

  // 5.1 5,1 555.1 555,1
  if (result.length === 2) {
    // 5555.111 or 5555,111
    if (result[0].length > 3 || result[1].length !== 3 || !thousandSeparator) {
      return Number.parseFloat(result.join("."));
    }
    // otherwise 5.111 and 5,111 are not clear and thousandSeparator is important
    const floatSep = thousandSeparator === "." ? "," : ".";
    return Number.parseFloat(s.replace(thousandSeparator, "").replace(floatSep, "."));
  }

  // otherwise 5555.111 | 5555,111 | 5,555.111 | 5.555.111
  const aSep = s.search(/,/);
  const bSep = s.search(/\./);
  let i1000 = Math.min(aSep, bSep);
  if (i1000 === -1) {
    i1000 = Math.max(aSep, bSep);
  }
  const sep1000 = s[i1000];
  const floatSep = sep1000 === "." ? "," : ".";
  return Number.parseFloat(s.replace(new RegExp(`[${sep1000}]`, "g"), "").replace(floatSep, "."));
};
