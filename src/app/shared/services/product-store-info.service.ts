import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProductListDto } from '../dtos/product-list.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductStoreInfoService {
  private productInfo = new Subject<ProductListDto>();
  currentProductInfo = this.productInfo.asObservable();

  saveProductInfo(product: ProductListDto) {
    this.productInfo.next(product);
  }
}
