import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderCreatedDto } from '../dtos/order-created.dto';
import { environment } from '../../../environments/environment.development';
import { OrderProductsDto } from '../dtos/order-products.dto';
import { OrderDto } from '../dtos/order.dto';
import { OrderSmallDetailDto } from '../dtos/order-small-detail.dto';
import { OrderConfirmDto } from '../dtos/order-confirm.dto';
import { PagingDto } from '../dtos/paging.dto';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}
  getOrder(id: string) {
    let reqUrl = environment.apiBaseUrl + '/Orders/' + id;
    return this.http.get<OrderDto>(reqUrl);
  }
  getProfile(pageIndex: number, pagesize: number) {
    let reqUrl = environment.apiBaseUrl + '/Orders/Profile';
    reqUrl = reqUrl + '?PageIndex=' + pageIndex;
    reqUrl = reqUrl + '&PageSize=' + pagesize;
    return this.http.get<PagingDto<OrderSmallDetailDto>>(reqUrl);
  }
  getOrderProducts(id: string) {
    let reqUrl = environment.apiBaseUrl + '/Orders/Products/' + id;
    return this.http.get<OrderSmallDetailDto>(reqUrl);
  }
  createOrder(req: OrderCreatedDto[]) {
    let reqUrl = environment.apiBaseUrl + '/Orders';
    return this.http.post<string>(reqUrl, req); //ให้ return id order กลับมา
  }
  deleteOrder(id: string) {
    let reqUrl = environment.apiBaseUrl + '/Orders/' + id;
    return this.http.delete(reqUrl);
  }
  confirmOrder(req: OrderConfirmDto) {
    let reqUrl = environment.apiBaseUrl + '/Orders/Confirm';
    return this.http.post<unknown>(reqUrl, req);
  }
}
