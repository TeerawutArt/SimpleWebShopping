import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { CartService } from '../../../shared/services/cart.service';
import { OrderService } from '../../../shared/services/order.service';
import { ProfileService } from '../../../shared/services/profile.service';
import { AccountAddressDto } from '../../../shared/dtos/account-address.dto';
import { OrderProductsDto } from '../../../shared/dtos/order-products.dto';
import { environment } from '../../../../environments/environment.development';
import { OrderDto } from '../../../shared/dtos/order.dto';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
  ],
  templateUrl: './confirm-order.component.html',
  styleUrl: './confirm-order.component.css',
})
export class ConfirmOrderComponent implements OnInit {
  defaultAddress!: AccountAddressDto;
  order!: OrderDto;

  loading: boolean = false; //ใส่ไว้ก่อนถ้ามีเวลาค่อยมาใส่ระบบ load
  rootImgUrl = environment.imageUrl;
  totalProductQuantity = 0;
  totalProductPrice = 0;
  totalPrice = 0;
  orderId = '';
  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private profileService: ProfileService,
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
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

        console.log(this.order);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
  getUserAddress() {
    this.profileService.getUserAddress().subscribe({
      next: (res) => {
        console.log(res);
        const haveDefaultAddress = res.find((a) => a.isDefault);
        if (haveDefaultAddress) {
          this.defaultAddress = haveDefaultAddress;
        } else {
          this.defaultAddress = res[0];
        }
        console.log(res);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
}
