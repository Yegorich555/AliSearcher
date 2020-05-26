export default class Product {
  description: string;
  link: string;
  linkImage: string;

  priceMin: number;
  priceMax: number;
  priceShipping: number;

  get priceTotalMin(): number {
    return this.priceMin + this.priceShipping;
  }
  get priceTotalMax(): number {
    return this.priceMax + this.priceShipping;
  }
  // freeShipping: boolean;
  unit: string;
  lotSizeNum: number; // todo  value + text
  lotSizeText: string;
  get unitPrice(): number {
    const min = this.priceTotalMin;
    if (!this.lotSizeNum) return min;
    return (min + 0.05) / this.lotSizeNum; // round to last point
  }

  storeRating: number;
  storeFeedbackCount: number;
  storeFeedbackLink: string;
  storeOrderCount: number;

  storeName: string;
  storeLink: string;
  storePositiveFeedback: string;
}
