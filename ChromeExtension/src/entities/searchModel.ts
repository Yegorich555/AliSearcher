export const SortTypes = {
  priceMinToMax: "Price: min to max",
  priceMaxToMin: "Price: max to min",
  minToMaxPieces: "Pcs: min to max",
  maxToMinPieces: "Pcs: min to max",
  numOrdersMaxToMin: "Orders: max to min",
  numOrdersMinToMax: "Orders: min to max"
};

export default class SearchModel {
  minPrice?: number;
  maxPrice?: number;
  minOrders?: number;
  minRating?: number;
  maxLotSize?: number;
  text?: string;
  textAli?: string;
  exclude?: string;
  sortType: keyof typeof SortTypes;
}
