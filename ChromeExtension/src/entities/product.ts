import { fixUrl } from "@/helpers";

let id = 0;
const getUniqueId = (): number => ++id;

const roundFloat = (num): number => Math.round(num * 100) / 100;
const regLotByDesc = /((\d+)-)?(\d+)\s?pcs/i;
export default class Product {
  static lotSizeByDesc(s: string): number | null {
    const result = regLotByDesc.exec(s);
    return (result && Number.parseInt(result[2] || result[3], 10)) || null;
  }
  id: number;

  description: string;
  link: string;
  linkImage: string;

  priceMin: number;
  priceMax?: number;
  priceShipping?: number;

  get priceTotalMin(): number {
    return roundFloat(this.priceMin + this.priceShipping);
  }

  get priceTotalMax(): number | null {
    return this.priceMax == null ? this.priceMax : roundFloat(this.priceMax + this.priceShipping);
  }

  unit: string;
  lotSizeNum?: number;
  lotSizeText?: string;
  get unitPrice(): number {
    const min = this.priceTotalMin;
    if (!this.lotSizeNum) return min;
    return roundFloat(min / this.lotSizeNum);
  }

  rating: number;
  storeOrderCount?: number;
  storeName: string;
  storeLink: string;

  searchText: string;
  searchId: string;
  date: Date;

  toString(): string {
    return `${this.priceMin}. ${this.description}`;
  }

  constructor(parsedItem?: any, searchText?: string) {
    this.date = new Date();
    if (!parsedItem) {
      return;
    }
    this.id = parsedItem.productId || getUniqueId();
    this.searchId = `${searchText}_${this.id}`;

    this.description = parsedItem.title;
    this.link = fixUrl(parsedItem.productDetailUrl);
    this.linkImage = fixUrl(parsedItem.imageUrl);

    const priceReg = /^(\D*)(\d*[.,]*\d*)\s*-{0,1}\s*(\d*[.,]*\d*)/;
    const price = priceReg.exec(parsedItem.price);
    // this.priceCurrency = price[1];
    this.priceMin = Number.parseFloat(price[2]);
    this.priceMax = Number.parseFloat(price[3]) || null;

    // replace fixes thousands: 1,326.23
    const priceShipping = Number.parseFloat((priceReg.exec(parsedItem.logisticsDesc)[2] || "0").replace(",", ""));
    this.priceShipping = priceShipping ? roundFloat(priceShipping) : 0;

    this.unit = parsedItem.saleUnit;
    this.lotSizeNum = parsedItem.leastPackagingNum;
    this.lotSizeText = (parsedItem.saleComplexUnit || "").replace("pieces", "");

    if (!this.lotSizeNum) {
      const lotSize = Product.lotSizeByDesc(this.description);
      if (lotSize && lotSize > 1) {
        this.lotSizeNum = lotSize;
        this.lotSizeText = "";
        this.unit = "set";
      }
    }

    this.rating = Number.parseFloat(parsedItem.starRating) || null;
    this.storeOrderCount = (parsedItem.tradeDesc && Number.parseInt(/(\d*)/.exec(parsedItem.tradeDesc)[1], 10)) || null;
    this.storeName = parsedItem.store?.storeName;
    this.storeLink = fixUrl(parsedItem.store?.storeUrl);

    this.searchText = searchText;
  }
}
