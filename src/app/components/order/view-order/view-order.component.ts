import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CutTextPipe } from '../../../shared/pipe/cut-text.pipe';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CartService } from '../../../shared/services/cart.service';
import { CouponService } from '../../../shared/services/coupon.service';
import { OrderService } from '../../../shared/services/order.service';
import { ProfileService } from '../../../shared/services/profile.service';
import { OrderSmallDetailDto } from '../../../shared/dtos/order-small-detail.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderDto } from '../../../shared/dtos/order.dto';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-view-order',
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
  templateUrl: './view-order.component.html',
  styleUrl: './view-order.component.css',
})
export class ViewOrderComponent implements OnInit {
  orderId = '';
  returnUrl = '';
  totalProductQuantity = 0;
  totalProductPrice = 0;
  totalPrice = 0;
  receiveNameIndex = 0;
  receivePhoneIndex = 0;
  addressInfo = '';
  splitText: Array<string> = [];
  order!: OrderDto;
  rootImgUrl = environment.imageUrl;
  loading: boolean = false; //ใส่ไว้ก่อนถ้ามีเวลาค่อยมาใส่ระบบ load
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
    this.getOrderProduct();
  }

  getOrderProduct() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (res: OrderDto) => {
        res.orderProducts.forEach((p) => {
          this.totalProductQuantity += p.productQuantity;
          this.totalProductPrice += p.netPrice;
        });
        this.order = res;
        console.log(this.order);
        this.splitText = this.order.transportInfo.split(' ');
        this.receiveNameIndex = this.splitText.findIndex((v) =>
          v.includes('ชื่อผู้รับ')
        );
        this.receivePhoneIndex = this.splitText.findIndex((v) =>
          v.includes('เบอร์โทรศัพท์')
        );
        this.addressInfo = this.splitText
          .slice(this.receivePhoneIndex + 1)
          .join(' ');
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
  return() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }
}
