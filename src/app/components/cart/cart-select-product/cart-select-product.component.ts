import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CartProductDto } from '../../../shared/dtos/cart-product.dto';
import { PanelModule } from 'primeng/panel';
import { CartService } from '../../../shared/services/cart.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartProductUpdateDto } from '../../../shared/dtos/cart-product-update.dto';
import { ProfileService } from '../../../shared/services/profile.service';
import { AccountAddressDto } from '../../../shared/dtos/account-address.dto';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
  selector: 'app-cart-select-product',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './cart-select-product.component.html',
  styleUrl: './cart-select-product.component.css',
})
export class CartSelectProductComponent implements OnInit {
  loading: boolean = false; //ใส่ไว้ก่อนถ้ามีเวลาค่อยมาใส่ระบบ load
  products!: CartProductDto[];
  cloneProducts!: CartProductDto[]; //ไว้สำหรับตรวจเงื่อนไขเฉยๆ
  rootImgUrl = environment.imageUrl;
  selectedProducts!: CartProductDto[];
  totalProductQuantity = 0;
  transportPrice = 0;
  totalPrice = 0;
  netPrice = 0;
  productQuantity!: number;
  defaultAddress!: AccountAddressDto;
  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private profileService: ProfileService
  ) {}
  ngOnInit(): void {
    this.getProductInCart();
    this.getUserAddress();
  }
  getProductInCart() {
    this.loading = true;
    this.cartService.GetUserCart().subscribe({
      next: (res) => {
        this.products = res;
        this.selectedProducts = res;
        this.cloneProducts = this.products.map((product) => ({ ...product })); //deep copy เพื่อไม่ให้ array ชี้ไปที่ mem เดียวกัน
        this.loading = false;
        console.log(this.selectedProducts);
        this.UpdateProductQuantity();
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
  UpdateProductQuantity() {
    this.totalProductQuantity = 0;
    this.transportPrice = 0;
    this.totalPrice = 0;
    this.netPrice = 0;
    this.selectedProducts.forEach((p) => {
      this.totalProductQuantity += p.quantity;
      if (p.discountId) {
        this.totalPrice += p.productDiscountPrice * p.quantity;
      } else {
        this.totalPrice += p.productPrice * p.quantity;
      }
      this.transportPrice += (p.productPrice * p.quantity) / 100; //มั่วสูตร
    });
    this.netPrice = this.totalPrice + this.transportPrice;
  }

  UpdateProductQuantityCart(event: any) {
    this.loading = true;
    this.messageService.clear();
    const updatedProductId = event.field;
    const updateProductQuantity = event.data;
    console.log(this.cloneProducts);

    const req: CartProductUpdateDto = {
      quantity: event.data,
    };
    const selectedProduct = this.cloneProducts.find(
      (p) => p.productId === updatedProductId
    );
    if (selectedProduct?.quantity === updateProductQuantity) return; //ถ้าเท่าเดิมก็ไม่ต้อง fetch data
    if (typeof updateProductQuantity === 'number') {
      this.cartService
        .UpdateProductQuantityCart(updatedProductId, req)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'แก้ไขเสร็จสิ้น',
              detail: 'แก้ไขจำนวนสินค้าแล้ว',
            });
            this.UpdateProductQuantity();
            this.loading = false;
            //อัปเดท cloneProducts อ่านยากหน่อยใช้ ternary operator กับ spread (...)
            this.cloneProducts = this.cloneProducts.map((p) =>
              p.productId === updatedProductId
                ? { ...p, quantity: updateProductQuantity }
                : p
            );
          },
        });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'ล้มเหลว',
        detail: 'จำนวนสินค้าต้องเป็นตัวเลขเท่านั้น!',
      });
      this.loading = false;
    }
  }

  deleteProductInCart(productId: string) {
    this.loading = true;
    this.cartService.deleteProductInCart(productId).subscribe({
      next: (_) => {
        this.getProductInCart();
        this.cartService.setUpdateCart(true); //ส่งสัญญาณไปให้ตะกร้าใน header
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
  //User Sections
  getUserAddress() {
    this.profileService.getUserAddress().subscribe({
      next: (res) => {
        const haveDefaultAddress = res.find((a) => a.isDefault);
        if (haveDefaultAddress) {
          this.defaultAddress = haveDefaultAddress;
        } else {
          this.defaultAddress = res[0];
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
}
