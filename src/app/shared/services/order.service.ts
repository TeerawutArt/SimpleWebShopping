import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderCreatedDto } from '../dtos/order-created.dto';
import { environment } from '../../../environments/environment.development';
import { OrderProductsDto } from '../dtos/order-products.dto';
import { OrderDto } from '../dtos/order.dto';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  getOrderProducts(id: string) {
    let reqUrl = environment.apiBaseUrl + '/Orders/Products/' + id;
    return this.http.get<OrderDto>(reqUrl);
  }
  createOrder(req: OrderCreatedDto[]) {
    let reqUrl = environment.apiBaseUrl + '/Orders';
    return this.http.post<string>(reqUrl, req);
  }
}
