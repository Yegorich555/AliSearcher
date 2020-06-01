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
