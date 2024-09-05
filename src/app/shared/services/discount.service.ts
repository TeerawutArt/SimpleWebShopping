import { Injectable } from '@angular/core';
import { ProductCreateDiscountDto } from '../dtos/product-create-discount.dto';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { DiscountListDto } from '../dtos/discount-list.dto';
import { DiscountUpdateDto } from '../dtos/discount-update.dto';
import { DiscountProductCancelDto } from '../dtos/discount-product-cancel';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  constructor(private http: HttpClient) {}
  getDiscountList() {
    let reqUrl = environment.apiBaseUrl + '/Discounts';
    return this.http.get<DiscountListDto[]>(reqUrl);
  }
  createDiscountProduct(req: ProductCreateDiscountDto) {
    let reqUrl = environment.apiBaseUrl + '/Discounts';
    return this.http.post<unknown>(reqUrl, req);
  }
  deleteDiscount(id: string) {
    let url = environment.apiBaseUrl + '/Discounts/' + id;
    return this.http.delete<unknown>(url);
  }
  updateDiscount(id: string, req: DiscountUpdateDto) {
    let url = environment.apiBaseUrl + '/Discounts/' + id;
    return this.http.put<unknown>(url, req);
  }
  cancelDiscount(req: DiscountProductCancelDto) {
    let url = environment.apiBaseUrl + '/Discounts/Cancel';
    return this.http.put<unknown>(url, req);
  }
}
