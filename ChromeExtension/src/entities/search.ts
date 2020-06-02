import axios from "axios";
import log from "./log";
import Product from "./product";
import { fixUrl, excludeRange } from "../helpers";
import SearchModel, { SortTypes, SearchParams } from "./searchModel";
import SearchProgress from "./searchProgress";
import Pagination from "./pagination";
import aliStore from "./aliStore";

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
    /** gathering pageInfo */
    const globals = await getGlobals("runConfigs", "runParams");
    const pageInfo = {
      pageSize: globals.runParams?.resultSizePerPage,
      items: globals.runParams?.items || [],
      totalItems: globals.runParams?.resultCount,
      url: new URL(fixUrl(globals.runConfigs?.searchAjaxUrl || window.location.href), window.location.origin)
    };
    // searchAjaxUrl isn't updated by user interaction only if the page reloads - in this case we need get url only to API part and params get from href
    pageInfo.url.search = window.location.search;

    if (!pageInfo.url.searchParams.has(SearchParams.text)) {
      throw new Error(
        `Url parameter "${SearchParams.text}" is not defined. Please use default Aliexpress search at first time`
      );
    }

    // todo add sort BestMatch is "default"
    // todo force clear params when model.prop is empty

    const products: Product[] = [];
    const progressAll: SearchProgress[] = [];
    function mergeResult(items: Product[], progress: SearchProgress): void {
      products.push(...items);
      // todo result is wrong. We must calculate: +cachedItems, join pageResults
      const i = progressAll.findIndex(v => v.text === progress.text);
      if (i === -1) {
        progressAll.push(progress);
      } else {
        progressAll[i] = progress;
      }
      // todo fire callback every 500ms instead of every call

      callback &&
        setTimeout(() =>
          callback({
            items: products,
            progress: progressAll
          })
        );
    }

    /** integration model with URL-params */
    model.sort &&
      SortTypes[model.sort].param &&
      pageInfo.url.searchParams.set(SearchParams.sort, SortTypes[model.sort].param);

    const urls: URL[] = [];
    function addUrl(text: string, minPrice?: number, maxPrice?: number): void {
      const url = new URL(pageInfo.url.href);
      const params = url.searchParams;
      params.set(SearchParams.text, text);
      minPrice && params.set(SearchParams.minPrice, minPrice.toString());
      maxPrice && url.searchParams.set(SearchParams.maxPrice, maxPrice.toString());

      urls.push(url);
    }

    const txtSearchArr = model.textAli
      ? model.textAli
          .split(/[,;]/g)
          .map(v => v.trim())
          .filter(v => v)
      : [pageInfo.url.searchParams.get(SearchParams.text)];

    for (let i = 0, text = txtSearchArr[0]; i < txtSearchArr.length; text = txtSearchArr[++i]) {
      /** getting products from store (cache) */
      // eslint-disable-next-line no-await-in-loop
      const items = await aliStore.getProducts(text, model.minPrice, model.maxPrice);
      if (items.length) {
        const dbMin = items.reduce((acc, v) => Math.min(acc, v.priceMin), Number.MAX_SAFE_INTEGER) - 0.01;
        const dbMax = items.reduce((acc, v) => Math.max(acc, v.priceMin), 0) + 0.01;
        excludeRange(model.minPrice, model.maxPrice, dbMin, dbMax).forEach(r => addUrl(text, r.min, r.max));
      } else {
        addUrl(text, model.minPrice, model.maxPrice);
      }

      products.push(...items);
      // todo for each url items + for cache
      progressAll.push(
        new SearchProgress({
          text,
          pagination: new Pagination({ totalItems: items.length, loadedPages: 0, totalPages: 0 })
        })
      );
    }

    // todo if (Object.keys(updatedModel).length) {
    //   callback && callback({ updatedModel: { ...model, ...updatedModel } });
    // }

    for (let u = 0, url = urls[u]; u < urls.length; url = urls[++u]) {
      try {
        this.httpIterate(url, (items, progress) => mergeResult(items, progress));
      } catch (e) {
        log.error(e);
      }
    }

    return products;
  };

  async httpIterate(url: URL, callback: (items: Product[], progress: SearchProgress) => void): Promise<void> {
    const searchText = url.searchParams.get(SearchParams.text);
    const min = url.searchParams.get(SearchParams.minPrice);
    const max = url.searchParams.get(SearchParams.maxPrice);

    const suffix = min == null || max == null ? "" : ` (${min != null ? min : ""};${max != null ? max : ""})`;
    const text = `${searchText}${suffix}`;

    const pagination = new Pagination({
      totalPages: 1
    });
    const t0 = performance.now();

    for (let i = 1; i <= pagination.totalPages; ++i) {
      url.searchParams.set("page", i.toString());
      log.info(url);
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.get(url.href);
      const { items, resultCount, resultSizePerPage } =
        typeof res.data === "string" ? this.extractJsObject(res.data, "runParams") : res.data;

      pagination.totalItems = resultCount;
      pagination.pageSize = resultSizePerPage;
      pagination.loadedPages = i;
      pagination.totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);
      if (!items) {
        log.error("No items\n", res);
        throw new Error("No items");
        // todo pause here
      }
      if (pagination.totalPages > 200) {
        throw new Error(
          `Too much pages: ${pagination.totalPages} for '${searchText}'. Expected < 201. Improve your search`
        );
      }

      const products = (items as any[]).map(v => new Product(v, searchText));
      aliStore.appendProducts(products);
      const t1 = performance.now();

      callback(
        products,
        new SearchProgress({
          text,
          pagination,
          speed: Math.round((t1 - t0) / i)
        })
      );
    }
  }

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
