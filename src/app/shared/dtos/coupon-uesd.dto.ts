export interface CouponUsedDto {
  couponId: string;
  couponName: string;
  couponCode: string;
  description: string;
  discountRate: number;
  isDiscountPercent: boolean;
  maxDiscount: number;
  minimumPrice: number;
}
