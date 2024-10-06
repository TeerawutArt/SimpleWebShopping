import { OrderProductsDto } from './order-products.dto';

export interface OrderDto {
  orderId: string;
  orderTime: Date;
  orderUserName: string;
  expiryTime: Date;
  isSuccess: boolean;
  status: string;
  transportInfo: string;
  totalPrice: number;
  transportPrice: number;
  orderProducts: Array<OrderProductsDto>;
}
