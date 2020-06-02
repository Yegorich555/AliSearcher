import axios from "axios";
import log from "./log";
import Product from "./product";
import { fixUrl, excludeRange } from "../helpers";
import SearchModel, { SortTypes, SearchParams } from "./searchModel";
import SearchProgress from "./searchProgress";
import Pagination from "./pagination";
import aliStore from "./aliStore";

let thottleTimerId: NodeJS.Timeout;
function throttleFunction(func: () => void, delay: number): void {
  if (thottleTimerId) {
    return;
  }

  thottleTimerId = setTimeout(() => {
    func();
    thottleTimerId = undefined;
  }, delay);
}

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
  searchSplitter = /[;]/g;
  cachedModel: SearchModel;
  cachedItems: Product[];

  isCached(model: SearchModel): boolean {
    return (
      model != null &&
      this.cachedModel != null &&
      model.textAli === this.cachedModel.textAli &&
      model.minPrice === this.cachedModel.minPrice &&
      model.maxPrice === this.cachedModel.maxPrice
    );
  }

  splitSearchText(text: string, splitPattern?: RegExp): string[] {
    return text
      .split(splitPattern || this.searchSplitter)
      .map(v => v.trim())
      .filter(v => v);
  }

  sortAndFilter(items: Product[], model: SearchModel): Product[] {
    let r = items;
    if (model.minPrice) {
      r = r.filter(v => v.priceTotalMin >= model.minPrice);
    }
    if (model.maxPrice) {
      r = r.filter(v => v.priceTotalMin <= model.maxPrice);
    }
    if (model.maxLotSize) {
      r = r.filter(v => !v.lotSizeNum || v.lotSizeNum < model.maxLotSize);
    }
    if (model.minOrders) {
      r = r.filter(v => v.storeOrderCount >= model.minOrders);
    }
    if (model.minRating) {
      r = r.filter(v => v.rating >= model.minRating);
    }

    // todo we use OR logic but we can use OR and AND
    if (model.text) {
      const reg = new RegExp(this.splitSearchText(model.text).join("|"), "i");
      r = r.filter(v => reg.test(v.description));
    }
    // todo we can use regex also
    if (model.exclude) {
      const reg = new RegExp(this.splitSearchText(model.exclude).join("|"), "i");
      r = r.filter(v => !reg.test(v.description));
    }

    if (model.sort) {
      // todo sort PriceByLotSize
      switch (model.sort) {
        case "priceMinToMax":
          r = r.sort((a, b) => {
            let sr = a.priceTotalMin - b.priceTotalMin;
            if (sr === 0) {
              sr = (a.storeOrderCount || 0) - (b.storeOrderCount || 0);
              if (sr === 0) {
                sr = a.rating - b.rating;
              }
            }
            return sr;
          });
          break;
        case "priceMaxToMin":
          r = r.sort((a, b) => {
            let sr = b.priceTotalMin - a.priceTotalMin;
            if (sr === 0) {
              sr = (a.storeOrderCount || 0) - (b.storeOrderCount || 0);
              if (sr === 0) {
                sr = a.rating - b.rating;
              }
            }
            return sr;
          });
          break;
        case "priceMinToMaxPcs":
          r = r.sort((a, b) => {
            let sr = a.unitPrice - b.unitPrice;
            if (sr === 0) {
              sr = (a.storeOrderCount || 0) - (b.storeOrderCount || 0);
              if (sr === 0) {
                sr = a.rating - b.rating;
              }
            }
            return sr;
          });
          break;
        case "ordersMaxToMin":
          r = r.sort((a, b) => {
            let sr = (b.storeOrderCount || 0) - (a.storeOrderCount || 0);
            if (sr === 0) {
              sr = a.priceTotalMin - b.priceTotalMin;
              if (sr === 0) {
                sr = a.rating - b.rating;
              }
            }
            return sr;
          });
          break;
        default:
          log.error("SortType is not defined");
          break;
      }
    }

    return r;
  }

  go = async (model: SearchModel, callback?: (obj: SearchCallbackObj) => void): Promise<any> => {
    if (this.isCached(model)) {
      return Promise.resolve(this.sortAndFilter(this.cachedItems, model));
    }

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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const products: Product[] = [];
    const progressAll: SearchProgress[] = [];

    function mergeResult(items?: Product[], progress?: SearchProgress, skipCallback?: boolean): void {
      if (items) {
        items.forEach(v => {
          const i = products.findIndex(p => p.id === v.id);
          if (i === -1) {
            products.push(v);
          }
        });
      }

      if (progress) {
        const i = progressAll.findIndex(v => v.text === progress.text);
        if (i === -1) {
          progressAll.push(progress);
        } else {
          progressAll[i] = progress;
        }
      }

      !skipCallback &&
        callback &&
        throttleFunction(
          () =>
            callback({
              items: self.sortAndFilter(products, model),
              progress: progressAll
            }),
          500
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

      mergeResult(
        null,
        new SearchProgress({
          text: self.mergeSearchText(text, minPrice, maxPrice),
          pagination: new Pagination()
        }),
        true
      );
    }

    const txtSearchArr = model.textAli
      ? this.splitSearchText(model.textAli)
      : [pageInfo.url.searchParams.get(SearchParams.text)];

    for (let i = 0, text = txtSearchArr[0]; i < txtSearchArr.length; text = txtSearchArr[++i]) {
      /** getting products from store (cache) */
      // eslint-disable-next-line no-await-in-loop
      const result = await aliStore.getProducts(text, model.minPrice, model.maxPrice);
      if (result?.items.length) {
        const dbMin = result.min - 0.01;
        const dbMax = result.max + 0.01;
        excludeRange(model.minPrice, model.maxPrice, dbMin, dbMax).forEach(r => addUrl(text, r.min, r.max));

        mergeResult(
          result.items,
          new SearchProgress({
            text: `${text} (cache)`,
            pagination: new Pagination({
              totalItems: result.items.length
            })
          }),
          true
        );
      } else {
        addUrl(text, model.minPrice, model.maxPrice);
      }
    }

    // calling empty merge for firing callback
    mergeResult();

    const req = [];
    for (let u = 0, url = urls[u]; u < urls.length; url = urls[++u]) {
      try {
        req.push(this.httpIterate(url, (items, progress) => mergeResult(items, progress)));
      } catch (e) {
        log.error(e);
      }
    }
    await Promise.all(req);

    this.cachedModel = { ...model };
    this.cachedItems = products;
    return this.sortAndFilter(products, model);
  };

  mergeSearchText(text: string, min?: number | string, max?: number | string): string {
    const suffix = min == null || max == null ? "" : ` (${min != null ? min : ""}..${max != null ? max : ""})`;
    return `${text}${suffix}`;
  }

  async httpIterate(url: URL, callback: (items: Product[], progress: SearchProgress) => void): Promise<void> {
    const searchText = url.searchParams.get(SearchParams.text);
    const min = url.searchParams.get(SearchParams.minPrice);
    const max = url.searchParams.get(SearchParams.maxPrice);
    const text = this.mergeSearchText(searchText, min, max);

    const pagination = new Pagination({
      totalPages: 1
    });
    const t0 = performance.now();

    for (let i = 1; i <= pagination.totalPages; ++i) {
      url.searchParams.set("page", i.toString());
      log.info(url);
      let res;
      try {
        // eslint-disable-next-line no-await-in-loop
        res = await axios.get(url.href);
      } catch (e) {
        log.error(e, `\nin [${text}]`);
        return;
      }
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
