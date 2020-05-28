import search from "../src/entities/search";
import fs from "fs";
import path from "path";

describe("search", () => {
  const htmlGood = fs.readFileSync(path.join(__dirname, "../mock/hc-12_page1.html"), "utf8");

  test("extracting runParams object from html", () => {
    const obj = search.extractJsObject(htmlGood, "runParams");
    expect(obj).toBeDefined();
    expect(obj.items).toBeDefined();
    expect(obj.items.length).toBe(60);
    expect(obj.resultCount).toBe(201);
    expect(obj.resultSizePerPage).toBe(60);
  });

  test("extracting runConfigs object from html", () => {
    const obj = search.extractJsObject(htmlGood, "runConfigs");
    expect(obj).toBeDefined();
    expect(typeof obj.searchAjaxUrl).toBe("string");
  });
});
