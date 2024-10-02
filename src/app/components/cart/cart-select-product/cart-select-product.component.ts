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
import { CutTextPipe } from '../../../shared/pipe/cut-text.pipe';

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
    CutTextPipe,
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
    console.log(this.selectedProducts);
    this.selectedProducts.forEach((p) => {
      this.totalProductQuantity += p.quantity;
      if (p.discountId) {
        this.totalPrice += p.productDiscountPrice * p.quantity;
      } else {
        this.totalPrice += p.productPrice * p.quantity;
      }
      this.transportPrice += Math.round((p.productPrice * p.quantity) / 100); //มั่วสูตร
    });
    this.netPrice = this.totalPrice + this.transportPrice;
  }

  UpdateProductQuantityCart(event: any) {
    this.messageService.clear();
    const updatedProductId = event.field;
    let updateProductQuantity = event.data;
    const selectedProduct = this.cloneProducts.find(
      (p) => p.productId === updatedProductId
    );
    const req: CartProductUpdateDto = {
      quantity:
        event.data > selectedProduct!.productTotalAmount
          ? selectedProduct?.productTotalAmount
          : event.data,
    };
    if (
      selectedProduct?.quantity === updateProductQuantity &&
      updateProductQuantity < selectedProduct!.productTotalAmount
    )
      return; //ถ้าเท่าเดิมก็ไม่ต้อง fetch data
    // prettier-ignore
    this.products = this.products.map((p) => //ตรวจสอบสินค้าว่ามีพอไหม อ่านยากหน่อยใช้ ternary operator กับ spread (...)
      p.productId === selectedProduct?.productId
        ? {
            ...p,
            quantity:
              updateProductQuantity > selectedProduct!.productTotalAmount
                ? selectedProduct.productTotalAmount
                : updateProductQuantity,
          }
        : p
    );
    if (updateProductQuantity > selectedProduct!.productTotalAmount) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'จำนวนสินค้าที่เลือกเกินสินค้าที่มีทั้งหมด',
        detail: `${selectedProduct?.productName} มีสินค้าทั้งหมด ${selectedProduct?.productTotalAmount} ชิ้น`,
        life: 3000,
      });
    }

    if (typeof updateProductQuantity === 'number') {
      this.loading = true;
      this.cartService
        .UpdateProductQuantityCart(updatedProductId, req)
        .subscribe({
          next: () => {
            //แก้ selectProducts บัค (ไม่ยอมอัปเดทค่าที่ได้รับในฟิล)
            this.selectedProducts = this.selectedProducts.map((sp) =>
              sp.productId === selectedProduct?.productId
                ? {
                    ...sp,
                    quantity:
                      updateProductQuantity >
                      selectedProduct!.productTotalAmount
                        ? selectedProduct.productTotalAmount
                        : updateProductQuantity,
                  }
                : sp
            );

            this.UpdateProductQuantity();
            this.loading = false;
            //อัปเดท cloneProducts
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
