import { Component, OnInit, ViewChild } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { ProfileService } from '../../../shared/services/profile.service';
import { HttpErrorResponse } from '@angular/common/http';

import { AccordionModule } from 'primeng/accordion';
import { environment } from '../../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { AccountProfileDto } from '../../../shared/dtos/account-profile.dto';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccountAddressDto } from '../../../shared/dtos/account-address.dto';
import {
  ConfirmationService,
  LazyLoadMeta,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AddressService } from '../../../shared/services/address.service';
import { OrderService } from '../../../shared/services/order.service';
import { OrderDto } from '../../../shared/dtos/order.dto';
import { Table, TableModule } from 'primeng/table';
import { CutTextPipe } from '../../../shared/pipe/cut-text.pipe';
import { OrderSmallDetailDto } from '../../../shared/dtos/order-small-detail.dto';
import { HelperService } from '../../../shared/services/helper.service';
import { PagingDto } from '../../../shared/dtos/paging.dto';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ImageModule,
    AccordionModule,
    CommonModule,
    ButtonModule,
    SplitButtonModule,
    TableModule,
    CutTextPipe,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  @ViewChild('pt') pt!: Table;
  loading = false;
  profile!: AccountProfileDto;
  rootImgUrl = environment.imageUrl;
  returnUrl = '';
  orders: OrderSmallDetailDto[] = [];
  selectedOrders: any[] = [];
  activeIndex: Array<number> = [];
  menuItems!: MenuItem[];
  curAddress!: AccountAddressDto;
  curDate!: Date;
  expandedRows = {};
  keyword: string = '';
  pageIndex = 1;
  pageSize = 5;
  pageSizeSelected = new Array();
  totalRecords = 0;
  constructor(
    private addressService: AddressService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private orderService: OrderService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.menuItems = this.settingAddressMenu();
    this.returnUrl = this.router.url;
    this.loading = true;
    this.getProfile();
  }
  valueChange() {
    this.pt.reset();
  }
  settingAddressMenu() {
    const settingItem: MenuItem[] = [
      {
        label: 'แก้ไข',
        icon: 'pi pi-pen-to-square',
        command: () => this.updateUserAddress(this.curAddress),
      },
      {
        label: 'ลบ',
        icon: 'pi pi-trash',
        command: () => this.deleteUserAddress(this.curAddress),
      },
    ];
    return settingItem;
  }
  getSeverity(status: string) {
    switch (status) {
      case 'รอชำระเงิน':
        return 'info';
      case 'อยู่ระหว่างจัดส่ง':
        return 'success';
      case 'จัดส่งแล้ว':
        return 'success';
    }
    return 'contrast';
  }
  getStatusInfo(status: string) {
    switch (status) {
      case 'รอชำระเงิน':
        return 'ชำระเงิน';
    }
    return 'ตรวจสอบ';
  }
  onClickManageBtn(orderId: string = '', status: string) {
    if (status == 'รอชำระเงิน') {
      this.router.navigate(['/order/' + orderId]);
    } else {
      this.router.navigate(['/viewOrder/' + orderId], {
        queryParams: { returnUrl: this.returnUrl },
      });
    }
  }
  getProfile() {
    this.profileService.getUserInfo().subscribe({
      next: (res) => {
        this.profile = res;
        this.activeIndex.push(
          this.profile.addresses.findIndex((a) => a.isDefault === true)
        );
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }
  getOrder(e: LazyLoadMeta) {
    this.pageIndex = Math.floor(e.first! / e.rows!) + 1;
    this.pageSize = e.rows!;
    console.log(this.pageIndex);
    this.orderService.getProfile(this.pageIndex, this.pageSize).subscribe({
      next: (res: PagingDto<OrderSmallDetailDto>) => {
        this.orders = res.items;
        console.log(this.orders);
        this.totalRecords = res.totalRecords;
        this.orders = this.orders.map((o) => ({
          ...o,
          expiryTime: new Date(o.expiryTime),
        }));

        this.orders.forEach((o) =>
          o.expiryTime.setFullYear(o.expiryTime.getFullYear() + 543)
        ); //แปลง ค.ศ.เป็น พ.ศ (ใช้ในการแสดงผลเท่านั้น)
        this.checkExpiryTime(); //ทุกๆครั้งที่มาหน้านี้ให้เรียกใช้ฟังก์ชั่น เช็คเวลาหมดอายุของ order (จริงๆควรจัดการที่หลังบ้าน)
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  updateDefaultAddress(address: AccountAddressDto) {
    this.messageService.clear();
    this.addressService
      .updateDefaultAddress(address.addressId, {
        isDefault: !address.isDefault,
      })
      .subscribe({
        next: (_) => {
          this.messageService.add({
            summary: 'เปลี่ยนที่อยู่เริ่มต้นเรียบร้อยแล้ว',
            severity: 'success',
            detail: `${address.addressName} เป็นที่อยู่เริ่มต้นแล้ว"`,
          });
          this.getProfile();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
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
  updateUserProfile() {
    this.returnUrl = this.router.url;
    this.router.navigate(['account/profile/update'], {
      state: { saveProduct: this.profile },
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  checkExpiryTime() {
    this.curDate = new Date();
    this.curDate.setFullYear(this.curDate.getFullYear() + 543);
    this.orders.forEach((o) => {
      if (
        this.curDate > o.expiryTime &&
        o.status == 'รอชำระเงิน' &&
        o.isPaid == false
      ) {
        this.deleteExpiryOrder(o.orderId);
      }
    });
  }

  deleteExpiryOrder(orderId: string) {
    this.orderService.deleteOrder(orderId).subscribe(); //ไม่ต้องแจ้งอะไรทั้งนั้น ตรงเงื่อนไขส่งไปลบเลย
  }
  deleteSelectedOrder(orderId: string) {
    this.confirmationService.confirm({
      message: `คุณกำลังจะยกเลิกออเดอร์`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.orderService.deleteOrder(orderId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบรายการ',
              severity: 'success',
              detail: `ออเดอร์สินค้าถูกยกเลิกแล้ว`,
            });
            this.valueChange();
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการทำรายการ',
          life: 3000,
        });
      },
    });
  }

  deleteUserAddress(curAddress: AccountAddressDto) {
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบที่อยู่ "${curAddress.addressName}"`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.addressService.deleteAddress(curAddress.addressId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบที่อยู่เรียบร้อย',
              severity: 'success',
              detail: `ที่อยู่ "${curAddress.addressName}" ถูกลบแล้ว`,
            });
            this.getProfile();
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการลบสินค้า',
          life: 3000,
        });
      },
    });
  }
}
