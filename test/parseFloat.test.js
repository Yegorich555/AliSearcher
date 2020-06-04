import { parseFloatUniv } from "../src/helpers";

describe("helpers.parseFloatUniv", () => {
  const arr = [
    // ordinary
    { text: "5", value: 5 },
    { text: "33333", value: 33333 },
    { text: "5,1", value: 5.1 },
    { text: "5.1", value: 5.1 },

    // with default floatSeparator
    { text: "2.333", value: 2.333 },
    { text: "2,333", value: 2.333 },
    { text: "2,333", value: 2333, thousandSep: "," },
    { text: "233.333", value: 233.333 },
    { text: "233,333", value: 233.333 },
    { text: "233,33", value: 233.33 },
    { text: "233.33", value: 233.33 },

    // thousand-separator are not required
    { text: "5555.111", value: 5555.111 },
    { text: "5555,111", value: 5555.111 },

    { text: "5.555.111", value: 5555111 },
    { text: "2,333.3", value: 2333.3 },
    { text: "2.333,3", value: 2333.3 },
    { text: "2,233,333.3", value: 2233333.3 },
    { text: "2,233,333.3", value: 2233333.3 },
    { text: "2,233,333", value: 2233333 }
  ];

  arr.forEach(v => {
    test(v.text, () => {
      expect(parseFloatUniv(v.text, v.thousandSep)).toEqual(v.value);
    });
  });
});
