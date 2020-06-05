export const SortTypes = {
  priceMinToMax: { text: "Price: min to max", param: "price_asc" },
  priceMaxToMin: { text: "Price: max to min", param: "price_desc" },
  priceMinToMaxPcs: { text: "Price (pcs): min to max", param: "price_asc" },
  // sort BestMatch is "default" for aliExpress
  ordersMaxToMin: { text: "Orders: max to min", param: "total_tranpro_desc" }
};

export const SearchParams = {
  text: "SearchText",
  sort: "SortType",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  page: "page"
};

export default class SearchModel {
  minPrice?: number;
  maxPrice?: number;
  minOrders?: number;
  minRating?: number;
  minLotSize?: number;
  maxLotSize?: number;
  text?: string;
  textAli?: string;
  exclude?: string;
  sort?: keyof typeof SortTypes;
}
