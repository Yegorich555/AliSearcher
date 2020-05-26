/** fix urls that don't have http prefix */
// eslint-disable-next-line import/prefer-default-export
import remove from "ytech-js-extensions/lib/array/remove";
import addIfNotExists from "ytech-js-extensions/lib/array/addIfNotExists";

export function fixUrl(url: string): string {
  return url.replace(/^\/\//, "https://");
}

// function for preventing ugly fast-blinking during updating states
export function PromiseWait(promiseFn, ms = 400) {
  return new Promise(resolve => {
    return setTimeout(() => resolve(promiseFn), ms);
  });
}

function update(getterKey, newItem) {
  const item = this.find(v => getterKey(v));
  Object.assign(item, newItem);
  return newItem;
}

export const arrayFunctions = { remove, addIfNotExists, update };
