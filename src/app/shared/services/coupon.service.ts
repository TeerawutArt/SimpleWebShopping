import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CouponCreateDto } from '../dtos/coupon-create.dto';
import { CouponUpdateDto } from '../dtos/coupon-update.dto';
import { CouponDto } from '../dtos/coupon.dto';
import { CouponAvailableDto } from '../dtos/coupon-available.dto';
import { CouponCodeDTO } from '../dtos/coupon-code.dto';
import { CouponUsedDto } from '../dtos/coupon-uesd.dto';
import { PagingDto } from '../dtos/paging.dto';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private http: HttpClient) {}
  getCouponList(keyword: string, pageIndex: number, pagesize: number) {
    let reqUrl = environment.apiBaseUrl + '/Coupons';
    reqUrl = reqUrl + '?keyword=' + encodeURIComponent(keyword); //encode เพราะจะได้ส่งอักษรพิเศษไปได้ เช่น spacebar
    reqUrl = reqUrl + '&PageIndex=' + pageIndex;
    reqUrl = reqUrl + '&PageSize=' + pagesize;
    return this.http.get<PagingDto<CouponDto>>(reqUrl);
  }
  createCoupon(req: CouponCreateDto) {
    let reqUrl = environment.apiBaseUrl + '/Coupons';
    return this.http.post<unknown>(reqUrl, req);
  }
  deleteCoupon(id: string) {
    let url = environment.apiBaseUrl + '/Coupons/' + id;
    return this.http.delete<unknown>(url);
  }
  deleteSelectedCoupons(selectedCouponId: string[]) {
    let url = environment.apiBaseUrl + '/Coupons/Delete/Selected';
    return this.http.delete<unknown>(url, {
      body: { SelectedCouponId: selectedCouponId },
    });
  }
  changeCouponAvailable(id: string, req: CouponAvailableDto) {
    let url = environment.apiBaseUrl + '/Coupons/ChangeAvailable/' + id;
    return this.http.put<unknown>(url, req);
  }
  updateCoupon(id: string, req: CouponUpdateDto) {
    let url = environment.apiBaseUrl + '/Coupons/' + id;
    return this.http.put<unknown>(url, req);
  }
  useCoupon(id: string, req: CouponCodeDTO) {
    let url = environment.apiBaseUrl + '/Coupons/Order/' + id;
    return this.http.post<unknown>(url, req);
  }
  cancelUsedCoupon(id: string) {
    let url = environment.apiBaseUrl + '/Coupons/Order/' + id;
    return this.http.delete<unknown>(url);
  }
  getUsedCoupon(orderId: string) {
    let url = environment.apiBaseUrl + '/Coupons/Used?OrderId=' + orderId;
    return this.http.get<CouponUsedDto[]>(url);
  }
}
