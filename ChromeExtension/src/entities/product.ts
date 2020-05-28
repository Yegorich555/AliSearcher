import { fixUrl } from "@/helpers";

let id = 0;
const getUniqueId = () => ++id;

export default class Product {
  id: number;
  description: string;
  link: string;
  linkImage: string;

  priceMin: number;
  priceMax?: number;
  priceShipping?: number;

  get priceTotalMin(): number {
    return this.priceMin + this.priceShipping;
  }

  get priceTotalMax(): number | null {
    return this.priceMax == null ? this.priceMax : this.priceMax + this.priceShipping;
  }

  unit: string;
  lotSizeNum: number;
  lotSizeText: string;
  get unitPrice(): number {
    const min = this.priceTotalMin;
    if (!this.lotSizeNum) return min;
    return Math.round((min * 100) / this.lotSizeNum) / 100;
  }

  rating: number;
  storeOrderCount?: number;
  storeName: string;
  storeLink: string;
  // storePositiveFeedback: string;
  // storeFeedbackCount: number;
  // storeFeedbackLink: string;
  // freeShipping: boolean;

  constructor(parsedItem: any) {
    this.id = parsedItem.productId || getUniqueId();

    this.description = parsedItem.title;
    this.link = fixUrl(parsedItem.productDetailUrl);
    this.linkImage = fixUrl(parsedItem.imageUrl);

    const priceReg = /^(\D*)(\d*[.,]*\d*)\s*-{0,1}\s*(\d*[.,]*\d*)/;
    const price = priceReg.exec(parsedItem.price);
    // this.priceCurrency = price[1];
    this.priceMin = Number.parseFloat(price[2]);
    this.priceMax = Number.parseFloat(price[3]) || null;
    this.priceShipping = Number.parseFloat(priceReg.exec(parsedItem.logisticDesc)[2]) || 0;

    this.unit = parsedItem.saleUnit;
    this.lotSizeNum = parsedItem.leastPackagingNum;
    this.lotSizeText = (parsedItem.saleComplexUnit || "").replace("pieces", "pcs");

    this.rating = Number.parseFloat(parsedItem.starRating) || null;
    this.storeOrderCount = (parsedItem.tradeDesc && Number.parseInt(/(\d*)/.exec(parsedItem.tradeDesc)[1], 10)) || null;
    this.storeName = parsedItem.store?.storeName;
    this.storeLink = fixUrl(parsedItem.store?.storeUrl);
  }
}
