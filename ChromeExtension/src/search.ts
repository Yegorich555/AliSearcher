import axios from "axios";
import log from "./log";
// import Product from "./product";

class SearchClass {
  go = async (): Promise<any> => {
    const { items, resultCount: totalItems } = window.runParams || {};
    if (!totalItems || !items || !items.length) {
      throw new Error("No items. Please use default Aliexpress search at first time");
    }

    const href = window.runConfigs?.searchAjaxUrl || window.location.href;
    const curUrl = new URL(href.replace(/^\/\//, "https://"), window.location.origin);
    if (!curUrl.searchParams.has("SearchText") && !curUrl.searchParams.has("page")) {
      throw new Error('Url parameter "SearchText" is not defined. Please use default Aliexpress search at first time');
    }

    const pageNum = Number.parseInt(curUrl.searchParams.get("page"), 10) || 1;
    const pageSize = items.length;
    const pages = Math.round((totalItems + pageSize) / pageSize);

    const products = [...items];
    for (let i = 1; i <= pages; ++i) {
      if (i === pageNum) {
        // eslint-disable-next-line no-continue
        continue;
      }
      curUrl.searchParams.set("page", i.toString());
      console.warn(curUrl);
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.get(curUrl.href);
      const { items: gotItems } = typeof res.data === "string" ? this.extractJsObject(res.data, "runParams") : res.data;
      if (!gotItems) {
        log.error("No items\n", res);
        throw new Error("No items");
        // todo pause here
      } else {
        products.push(...gotItems);
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
