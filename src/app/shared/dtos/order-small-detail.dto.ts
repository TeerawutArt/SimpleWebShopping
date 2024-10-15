import { OrderProductsDto } from './order-products.dto';

export interface OrderSmallDetailDto {
  orderId: string;
  orderTime: Date;
  expiryTime: Date;
  isPaid: boolean;
  usedCoupon: boolean;
  status: string;
  totalPrice: number;
  netPrice: number;
  transportPrice: number;
  orderProducts: Array<OrderProductsDto>;
}
