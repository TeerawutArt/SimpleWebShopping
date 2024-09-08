export interface CouponDto {
  couponId: string;
  couponName: string;
  couponCode: string;
  description: string;
  startTime: Date;
  endTime: Date;
  amount: number;
  usedAmount: number;
  discountRate: number;
  isCouponAvailable: boolean;
  isDiscountPercent: boolean;
  maxDiscount: number;
  minimumPrice: number;
  status: string;
}
