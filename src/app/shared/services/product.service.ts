import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ProductCreatedDto } from '../dtos/product-created.dto';
import { ProductListDto } from '../dtos/product-list.dto';
import { PagingDto } from '../dtos/paging.dto';
import { ProductUpdateDto } from '../dtos/product-update.dto';
import { ProductUpdateAvailableDto } from '../dtos/product-update-available.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  createProduct(req: ProductCreatedDto, file: File | string) {
    let url = environment.apiBaseUrl + '/Products';
    //ตรงนี้จะส่งข้อมูลไปแบบ multipart/form-data
    const formData = new FormData();
    formData.append('productImage', file);
    formData.append('name', req.name);
    formData.append('description', req.description);
    formData.append('totalAmount', req.productAmount);
    formData.append('price', req.price);
    // prettier-ignore
    req.CategoryId.forEach((CateId) => formData.append('categoryId[]', CateId));

    return this.http.post<unknown>(url, formData);
  }
  updateProduct(req: ProductUpdateDto, file: File | string, productId: string) {
    let url = environment.apiBaseUrl + '/Products/' + productId;
    console.log(req);
    console.log(productId);
    //ตรงนี้จะส่งข้อมูลไปแบบ multipart/form-data
    const formData = new FormData();
    if (file !== '') formData.append('productImage', file);
    formData.append('name', req.name);
    formData.append('totalAmount', req.productAmount);
    formData.append('description', req.description);
    formData.append('price', req.price);
    req.CategoryId.forEach((CateId) => formData.append('categoryId[]', CateId));
    return this.http.put<unknown>(url, formData);
  }
  getAllProduct(
    manageProductMode: boolean,
    keyword: string,
    pageIndex: number,
    pagesize: number,
    hideDisableProduct: boolean
  ) {
    let url = environment.apiBaseUrl + '/Products';
    url = url + '?PageIndex=' + pageIndex;
    url = url + '&PageSize=' + pagesize;
    url = url + '&ManageProductMode=' + manageProductMode;
    url = url + '&HideDisableProduct=' + hideDisableProduct;
    url = url + '&keyword=' + encodeURIComponent(keyword); //encode เพราะจะได้ส่งอักษรพิเศษไปได้ เช่น spacebar
    return this.http.get<PagingDto<ProductListDto>>(url);
  }
  deleteProduct(id: string) {
    let url = environment.apiBaseUrl + '/Products/' + id;
    return this.http.delete<unknown>(url);
  }
  changeProductAvailable(id: string, req: ProductUpdateAvailableDto) {
    let url = environment.apiBaseUrl + '/Products/ChangeAvailable/' + id;
    return this.http.put<unknown>(url, req);
  }

  remainTime(endDate: Date) {
    const curDate = new Date();
    curDate.setFullYear(curDate.getFullYear() + 543); //แปลงเป็น พ.ศ ด้วย
    // prettier-ignore
    const differTimeMs = endDate.getTime() - curDate.getTime(); //millisecond
    //แปลง มิลลิวินาที ให้อยู่ในรูปของเวลา day:hour:minute
    const days = Math.floor(differTimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (differTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((differTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      day: days,
      hour: hours,
      minute: minutes,
    };
  }
}
