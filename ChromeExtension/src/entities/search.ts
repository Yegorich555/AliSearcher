import axios from "axios";
import log from "./log";
import Product from "./product";
import { fixUrl } from "../helpers";
import SearchModel, { SortTypes, SearchParams } from "./searchModel";
import SearchProgress from "./searchProgress";
import Pagination from "./pagination";

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
      throw new Error('Url parameter "SearchText" is not defined. Please use default Aliexpress search at first time');
    }

    /** integration model with URL-params */
    // todo force clear params when model.prop is empty
    // todo const searchTexts = model.textAli?.split(/;/g) || [curUrl.searchParams.get(searchParams.text)];
    // todo smart-cache
    const nextUrl = pageInfo.url; // todo it doesn't create new url
    const updatedModel: Partial<SearchModel> = {};

    function modelToParams<T>(
      paramKey: keyof typeof SearchParams,
      modelKey: keyof SearchModel,
      parseString?: (v: string) => T
    ): T {
      if (model[modelKey]) {
        nextUrl.searchParams.set(SearchParams[paramKey], model[modelKey].toString());
        return (model as any)[modelKey] as T;
      }
      const param = nextUrl.searchParams.get(SearchParams[paramKey]);
      (updatedModel as any)[modelKey] = (parseString && parseString(param)) || param;
      return (param as unknown) as T;
    }
    const searchText = modelToParams("text", "textAli") as string;
    modelToParams("minPrice", "minPrice", Number.parseFloat);
    modelToParams("maxPrice", "maxPrice", Number.parseFloat);
    // todo sort via modelToParams; add BestMatch is "default"
    model.sort &&
      SortTypes[model.sort].param &&
      nextUrl.searchParams.set(SearchParams.sort, SortTypes[model.sort].param);

    /** pages-calculation */
    const products = [] as Product[];

    const pagination = new Pagination({
      pageSize: pageInfo.pageSize,
      totalPages: 1
    });

    if (Object.keys(updatedModel).length) {
      callback && callback({ updatedModel: { ...model, ...updatedModel } });
    }

    const t0 = performance.now();
    for (let i = 1; i <= pagination.totalPages; ++i) {
      nextUrl.searchParams.set("page", i.toString());
      log.info(nextUrl);
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.get(nextUrl.href);
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

      (items as any[]).forEach(v => products.push(new Product(v)));
      const t1 = performance.now();
      callback &&
        callback({
          items: products,
          progress: [
            new SearchProgress({
              text: searchText,
              pagination,
              speed: Math.round((t1 - t0) / i)
            })
          ]
        });
    }

    // eslint-disable-next-line consistent-return
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
