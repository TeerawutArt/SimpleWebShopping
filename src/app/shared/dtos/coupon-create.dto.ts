export interface CouponCreateDto {
  couponName: string;
  couponCode: string;
  description: string;
  startTime: Date;
  endTime: Date;
  amount: number;
  discountRate: number;
  isDiscountPercent: boolean;
  maxDiscount: number;
  minimumPrice: number;
}
