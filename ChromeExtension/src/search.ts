import axios from "axios";
import log from "./log";

class SearchClass {
  go(rawUrl: string): void {
    // const url = encodeURI(rawUrl);
    axios.get(rawUrl).then(res => {
      console.log(res);
    });
  }

  // extracting js-assignment inside html
  extractJsObject = <T>(html: string, key: string): T => {
    // very important to define ';' at the end otherwise it doesn't work
    const result = new RegExp(
      `${key}\\s*=\\s*({\\s*['"[{a-zA-Z][^;]+})\\s*;`,
      "g"
    ).exec(html);

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

  // parseHtml(html: string): void {
  //   const itemsResult = this.extractJsObject(html, "runParams");
  // }
}

const search = new SearchClass();

export default search;
