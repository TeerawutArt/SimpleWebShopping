import { OrderProductsDto } from './order-products.dto';

export interface OrderDto {
  orderId: string;
  userId: string;
  orderUserName: string;
  orderTime: Date;
  expiryTime: Date;
  transactionTime: Date;
  isPaid: boolean;
  status: string;
  transportInfo: string;
  totalPrice: number;
  transportPrice: number;
  usedCoupon: boolean;
  netPrice: number;
  orderProducts: Array<OrderProductsDto>;
}
