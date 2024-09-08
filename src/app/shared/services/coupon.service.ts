import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CouponCreateDto } from '../dtos/coupon-create.dto';
import { CouponUpdateDto } from '../dtos/coupon-update.dto';
import { CouponDto } from '../dtos/coupon.dto';
import { CouponAvailableDto } from '../dtos/coupon-available.dto';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private http: HttpClient) {}
  getCouponList(keyword: string) {
    let reqUrl = environment.apiBaseUrl + '/Coupons';
    reqUrl = reqUrl + '?keyword=' + encodeURIComponent(keyword); //encode เพราะจะได้ส่งอักษรพิเศษไปได้ เช่น spacebar
    return this.http.get<CouponDto[]>(reqUrl);
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
}
