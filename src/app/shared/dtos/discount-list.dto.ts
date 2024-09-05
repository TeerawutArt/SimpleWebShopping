import { DiscountProductDetailDto } from './discount-product-detail';

export interface DiscountListDto {
  discountId: string;
  discountName: string;
  description: string;
  startTime: Date;
  endTime: Date;
  discountRate: number;
  IsDiscounted: boolean;
  isDiscountPercent: boolean;
  discountProduct: Array<DiscountProductDetailDto>;
}
