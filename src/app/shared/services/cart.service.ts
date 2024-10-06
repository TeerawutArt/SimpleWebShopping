import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CartCreateDto } from '../dtos/cart-create.dto';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartProductDto } from '../dtos/cart-product.dto';
import { CartProductUpdateDto } from '../dtos/cart-product-update.dto';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private http: HttpClient) {}
  private isCartAddProduct = new Subject<boolean>();
  cartChanged = this.isCartAddProduct.asObservable();

  setUpdateCart(isAddProduct: boolean) {
    this.isCartAddProduct.next(isAddProduct);
  }
  AddProductCart(req: CartCreateDto) {
    let url = environment.apiBaseUrl + '/Carts';
    return this.http.post<unknown>(url, req);
  }
  GetUserCart() {
    let url = environment.apiBaseUrl + '/Carts';
    return this.http.get<CartProductDto[]>(url);
  }
  deleteProductInCart(id: string) {
    let url = environment.apiBaseUrl + '/Carts/CartItem/product/' + id;
    return this.http.delete<unknown>(url);
  }
  UpdateProductQuantityCart(id: string, req: CartProductUpdateDto) {
    let url = environment.apiBaseUrl + '/Carts/CartItem/product/' + id;
    return this.http.put<unknown>(url, req);
  }
  removeAllProduct() {
    let url = environment.apiBaseUrl + '/Carts/CartItem/Clear';
    return this.http.delete<unknown>(url);
  }
}
