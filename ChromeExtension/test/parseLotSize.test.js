import Product from "../src/entities/product";

describe("parseLotSize", () => {
  const arr = [
    { text: "5pcs/lot some package", value: 5 },
    { text: "5pcs", value: 5 },
    { text: "some package 10pcs/lot something here", value: 10 },
    { text: "5pcs/lot some package", value: 5 },
    { text: "5-20pcs", value: 5 },
    { text: "5pcs/lot some package", value: 5 },
    { text: "20PCS/50PCS", value: 20 },
    { text: "2pcs-20pcs", value: 2 }
  ];

  arr.forEach(v => {
    test(v.text, () => {
      expect(Product.lotSizeByDesc(v.text)).toEqual(v.value);
    });
  });
});
