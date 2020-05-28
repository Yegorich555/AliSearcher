import axios from "axios";
import log from "./entities/log";
import Product from "./entities/product";
import { fixUrl } from "./helpers";
import SearchModel, { SortTypes, SearchParams } from "./entities/searchModel";
import SearchProgress from "./entities/searchProgress";

// provides variables between isolated scopes
function getGlobals(...params: string[]): Promise<any> {
  return new Promise(resolve => {
    const el = document.createElement("script");
    el.textContent = `(function(){
        let event = document.createEvent("CustomEvent"); 
        event.initCustomEvent("AliCustomEvent", true, true, {"passback": {${params.join(",")} }});
        setTimeout(()=>window.dispatchEvent(event), 1) 
        })()`;
    (document.head || document.documentElement).appendChild(el);
    const callback = (e: any): void => {
      const check = e.detail.passback;
      window.removeEventListener("AliCustomEvent", callback);
      el.parentNode.removeChild(el);
      resolve(check);
    };
    window.addEventListener("AliCustomEvent", callback);
  });
}

export interface SearchCallbackObj {
  updatedModel?: Partial<SearchModel>;
  progress?: SearchProgress[];
  items?: Product[];
}

class SearchClass {
  go = async (model: SearchModel, callback?: (obj: SearchCallbackObj) => void): Promise<any> => {
    const callbackObj: SearchCallbackObj = {};

    const globals = await getGlobals("runConfigs", "runParams");
    const { items, resultCount: totalItems } = globals.runParams || {};
    if (!totalItems || !items || !items.length) {
      throw new Error("No items. Please use default Aliexpress search at first time");
    }

    const href = globals.runConfigs?.searchAjaxUrl || window.location.href;
    const curUrl = new URL(fixUrl(href), window.location.origin);
    // searchAjaxUrl isn't updated by user interaction only if the page reloads - in this case we need get url only to API part and params get from href
    curUrl.search = window.location.search;
    if (!curUrl.searchParams.has(SearchParams.text) && !curUrl.searchParams.has("page")) {
      throw new Error('Url parameter "SearchText" is not defined. Please use default Aliexpress search at first time');
    }

    /** integration model with URL-params */
    // todo force clear params when model.prop is empty
    // todo const searchTexts = model.textAli?.split(/;/g) || [curUrl.searchParams.get(searchParams.text)];
    // todo smart-cache
    const updatedModel: Partial<SearchModel> = {};
    function modelToParams<T>(
      paramKey: keyof typeof SearchParams,
      modelKey: keyof SearchModel,
      parseString?: (v: string) => T
    ): T {
      if (model[modelKey]) {
        curUrl.searchParams.set(SearchParams[paramKey], model[modelKey].toString());
        return (model as any)[modelKey] as T;
      }
      const param = curUrl.searchParams.get(SearchParams[paramKey]);
      (updatedModel as any)[modelKey] = (parseString && parseString(param)) || param;
      return (param as unknown) as T;
    }
    const searchText = modelToParams("text", "textAli") as string;
    modelToParams("minPrice", "minPrice", Number.parseFloat);
    modelToParams("maxPrice", "maxPrice", Number.parseFloat);
    // todo sort via modelToParams; add BestMatch is "default"
    model.sort &&
      SortTypes[model.sort].param &&
      curUrl.searchParams.set(SearchParams.sort, SortTypes[model.sort].param);

    /** pages-calculation */
    const pageNum = Number.parseInt(curUrl.searchParams.get("page"), 10) || 1;
    const pageSize = items.length;
    const pages = Math.ceil(totalItems / pageSize);

    const products = (items as any[]).map(v => new Product(v));

    if (Object.keys(updatedModel).length) {
      callbackObj.updatedModel = { ...model, ...updatedModel };
    }
    callbackObj.items = products;
    callbackObj.progress = [
      new SearchProgress({
        text: searchText,
        totalItems,
        progress: { loadedPages: 1, totalPages: pages }
      })
    ];
    callback && callback(callbackObj);

    const t0 = performance.now();
    let cnt = 0;
    for (let i = 1; i <= pages; ++i) {
      if (i === pageNum) {
        // eslint-disable-next-line no-continue
        continue;
      }
      ++cnt;
      curUrl.searchParams.set("page", i.toString());
      log.warn(curUrl); // todo log.info
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.get(curUrl.href);
      const {
        items: gotItems
      }: {
        items: any[];
      } = typeof res.data === "string" ? this.extractJsObject(res.data, "runParams") : res.data;
      if (!gotItems) {
        log.error("No items\n", res);
        throw new Error("No items");
        // todo pause here
      } else {
        gotItems.forEach(v => products.push(new Product(v)));
        const t1 = performance.now();
        callback &&
          callback({
            items: products,
            progress: [
              new SearchProgress({
                text: searchText,
                totalItems,
                progress: { loadedPages: i, totalPages: pages },
                speed: Math.round((t1 - t0) / cnt)
              })
            ]
          });
      }
    }

    return products;
  };

  // extracting js-assignment inside html
  extractJsObject = <T>(html: string, key: string): T => {
    // very important to define ';' at the end otherwise it doesn't work
    const result = new RegExp(`${key}\\s*=\\s*({\\s*['"[{a-zA-Z][^;]+})\\s*;`, "g").exec(html);

    try {
      if (result && result[1]) {
        // eslint-disable-next-line no-new-func
        return Function(`"use strict";return (${result[1]})`)();
        // return JSON.parse(result[1]);
      }
    } catch (error) {
      log.error(error, result[1]);
    }
    log.error("Error parsing html. Unable to define js-object-assignment");
    return null;
  };
}

const search = new SearchClass();

export default search;
