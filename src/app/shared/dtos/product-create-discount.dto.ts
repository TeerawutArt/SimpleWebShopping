export interface ProductCreateDiscountDto {
  discountName: string;
  discountDescription: string;
  startTime: Date;
  endTime: Date;
  discountRate: number;
  isDiscountPercent: boolean;
  productId: Array<string>;
  categoriesId: Array<string>;
}
