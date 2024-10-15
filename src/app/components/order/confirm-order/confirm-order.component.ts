import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { CutTextPipe } from '../../../shared/pipe/cut-text.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CartService } from '../../../shared/services/cart.service';
import { OrderService } from '../../../shared/services/order.service';
import { ProfileService } from '../../../shared/services/profile.service';
import { AccountAddressDto } from '../../../shared/dtos/account-address.dto';
import { OrderProductsDto } from '../../../shared/dtos/order-products.dto';
import { environment } from '../../../../environments/environment.development';
import { OrderDto } from '../../../shared/dtos/order.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OrderSmallDetailDto } from '../../../shared/dtos/order-small-detail.dto';
import { TagModule } from 'primeng/tag';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { HelperService } from '../../../shared/services/helper.service';
import { CouponService } from '../../../shared/services/coupon.service';
import { CouponCodeDTO } from '../../../shared/dtos/coupon-code.dto';
import { getErrorMessage } from '../../../interceptors/error.interceptor';
import { CouponUsedDto } from '../../../shared/dtos/coupon-uesd.dto';
import { OrderConfirmDto } from '../../../shared/dtos/order-confirm.dto';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-confirm-order',
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
    ProgressSpinnerModule,
    TagModule,
    SplitButtonModule,
    CardModule,
  ],
  templateUrl: './confirm-order.component.html',
  styleUrl: './confirm-order.component.css',
})
export class ConfirmOrderComponent implements OnInit {
  addressMenu: MenuItem[] = [];
  allAddress!: AccountAddressDto[];
  defaultAddress!: AccountAddressDto;
  selectedAddress!: AccountAddressDto;
  order!: OrderSmallDetailDto;
  loading: boolean = false; //ใส่ไว้ก่อนถ้ามีเวลาค่อยมาใส่ระบบ load
  rootImgUrl = environment.imageUrl;
  totalProductQuantity = 0;
  totalProductPrice = 0;
  totalPrice = 0;
  orderId = '';
  returnUrl = '';
  maxAddressNum = 3;
  errorMessage: string = '';
  couponCode: string = '';
  usedCoupon!: CouponUsedDto[];
  constructor(
    private messageService: MessageService,
    private router: Router,
    private profileService: ProfileService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private couponService: CouponService,
    private cartService: CartService
  ) {}
  ngOnInit(): void {
    this.returnUrl = this.router.url;
    this.orderId = this.route.snapshot.params['id'] || null;
    console.log(this.orderId);
    this.getUserAddress();
    this.getOrderProduct();
  }
  getOrderProduct() {
    this.orderService.getOrderProducts(this.orderId).subscribe({
      next: (res) => {
        res.orderProducts.forEach((p) => {
          this.totalProductQuantity += p.productQuantity;
          this.totalProductPrice += p.netPrice;
        });
        this.order = res;
        //ตรวจว่ามีการใช้คูปองในออเดอร์นี้หรือยัง
        this.getUsedCoupon();
        this.cartService.setUpdateCart(true);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  selectNewAddress(addressId: string) {
    this.addressMenu = this.addressMenu.map((a) =>
      a.id == addressId
        ? { ...a, styleClass: 'colorText', icon: 'pi pi-arrow-right' }
        : { ...a, styleClass: '', icon: '' }
    ); //คือ การทำ manual highlight active selected text (ทำไม primeng ไม่มี?)
    const searchAddress = this.allAddress.filter(
      (a) => a.addressId == addressId
    );
    if (searchAddress.length > 0) {
      this.selectedAddress = searchAddress[0]; //ใช้ find ถ้าไม่เจอ return undefined ยุ่งยาก เขียนแบบนี้ดักนี่แหละ
    }
  }
  updateUserAddress(curAddress: AccountAddressDto) {
    this.returnUrl = this.router.url;
    this.router.navigate(
      ['account/profile/address/' + curAddress.addressId + '/update'],
      {
        state: { saveProduct: curAddress },
        queryParams: { returnUrl: this.returnUrl },
      }
    );
  }
  onUsedCoupon() {
    this.couponService
      .useCoupon(this.order.orderId, { couponCode: this.couponCode })
      .subscribe({
        next: (_) => {
          this.getOrderProduct();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.errorMessage = err.message;
          console.log(this.errorMessage);
          this.loading = false;
        },
      });
  }
  onCancelUsedCoupon() {
    this.couponService.cancelUsedCoupon(this.order.orderId).subscribe({
      next: (_) => {
        this.getOrderProduct();
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.errorMessage = err.message;
        console.log(this.errorMessage);
        this.loading = false;
      },
    });
  }
  confirmOrder(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'ยืนยันการชำระเงิน?',
      header: 'สั่งซื้อสินค้า',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ชำระเงิน',
      rejectLabel: 'ยกเลิก',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.onConfirmOrder();
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการชำระเงิน',
          life: 1000,
        });
      },
    });
  }
  onConfirmOrder() {
    this.loading = true;
    const addressInfo = `ชื่อผู้รับ:${this.selectedAddress.receiverName} เบอร์โทรศัพท์:${this.selectedAddress.receiverPhoneNumber} ที่อยู่${this.selectedAddress.addressInfo}`;
    const req: OrderConfirmDto = {
      orderId: this.order.orderId,
      AddressInfo: addressInfo,
      transaction: true,
    };
    this.orderService.confirmOrder(req).subscribe({
      next: (_) => {
        this.messageService.add({
          severity: 'info',
          summary: 'ชำระเงิน',
          detail: 'ชำระเงินเสร็จสิ้น',
        });
        setTimeout(() => {
          this.router.navigate(['account/profile/']);
          this.loading = false;
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message;
        console.log(this.errorMessage);
        this.loading = false;
      },
    });
  }
  getUsedCoupon() {
    this.couponService.getUsedCoupon(this.order.orderId).subscribe({
      next: (res: CouponUsedDto[]) => {
        this.usedCoupon = res;
        if (this.usedCoupon.length === 0) return;
        this.couponCode = this.usedCoupon[0].couponCode;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message;
        console.log(this.errorMessage);
        this.loading = false;
      },
    });
  }
  getUserAddress() {
    this.profileService.getUserAddress().subscribe({
      next: (res) => {
        this.allAddress = res;
        const haveDefaultAddress = res.find((a) => a.isDefault);
        if (haveDefaultAddress) {
          this.defaultAddress = haveDefaultAddress;
        } else {
          this.defaultAddress = res[0];
        }
        this.selectedAddress = this.defaultAddress;
        this.addressMenu = res.map((a) =>
          a.isDefault
            ? {
                icon: 'pi pi-arrow-right',
                styleClass: 'colorText',
                label: a.addressName,
                id: a.addressId,
                command: () => this.selectNewAddress(a.addressId),
              }
            : {
                icon: '',
                styleClass: '',
                label: a.addressName,
                id: a.addressId,
                command: () => this.selectNewAddress(a.addressId),
              }
        ); // default address highlight

        console.log(this.selectedAddress);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
  onOrderSSuccess() {
    this.router.navigate(['/']);
  }
}
