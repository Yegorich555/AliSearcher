import { excludeRange } from "../src/helpers";

describe("excludeRange", () => {
  test("excluded range smaller", () => {
    const result = excludeRange(1, 10, 2, 5);
    expect(result).toEqual([
      { min: 1, max: 2 },
      { min: 5, max: 10 }
    ]);
  });

  test("excluded range bigger", () => {
    const result = excludeRange(2, 5, 1, 10);
    expect(result).toEqual([]);
  });

  test("min bigger excludedMax", () => {
    const result = excludeRange(11, 13, 1, 10);
    expect(result).toEqual([{ min: 11, max: 13 }]);
  });

  test("max smaller excludedMin", () => {
    const result = excludeRange(1, 4, 5, 10);
    expect(result).toEqual([{ min: 1, max: 4 }]);
  });

  test("min:null, max smaller", () => {
    const result = excludeRange(null, 8, 5, 10);
    expect(result).toEqual([{ min: null, max: 5 }]);
  });

  test("min:null, max bigger", () => {
    const result = excludeRange(null, 12, 5, 10);
    expect(result).toEqual([
      { min: null, max: 5 },
      { min: 10, max: 12 }
    ]);
  });

  test("max:null, min bigger", () => {
    const result = excludeRange(6, null, 5, 10);
    expect(result).toEqual([{ min: 10, max: null }]);
  });

  test("max:null, min smaller", () => {
    const result = excludeRange(4, null, 5, 10);
    expect(result).toEqual([
      { min: 4, max: 5 },
      { min: 10, max: null }
    ]);
  });

  test("max:null, min:null", () => {
    const result = excludeRange(null, null, 5, 10);
    expect(result).toEqual([
      { min: null, max: 5 },
      { min: 10, max: null }
    ]);
  });
});
