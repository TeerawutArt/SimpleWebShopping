import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DiscountService } from '../../../shared/services/discount.service';
import { DiscountListDto } from '../../../shared/dtos/discount-list.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DiscountProductDetailDto } from '../../../shared/dtos/discount-product-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { DiscountProductCancelDto } from '../../../shared/dtos/discount-product-cancel';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-discount-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    TagModule,
    CommonModule,
    SplitButtonModule,
    CardModule,
  ],
  templateUrl: './discount-list.component.html',
  styleUrl: './discount-list.component.css',
})
export class DiscountListComponent implements OnInit {
  loading: boolean = false;
  menuItems!: MenuItem[];
  targetDiscount!: DiscountListDto;
  discounts: DiscountListDto[] = [];
  selectedProducts: any[] = [];
  totalDiscount = 0;
  expandedRows = {};
  returnUrl = '';
  constructor(
    private discountService: DiscountService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.getDiscountList();
  }
  settingMenu(): MenuItem[] {
    const settingItem: MenuItem[] = [
      {
        label: 'แก้ไข',
        icon: 'pi pi-pen-to-square',
        command: () => this.updateDiscountProduct(this.targetDiscount),
      },
      {
        label: 'ลบ',
        icon: 'pi pi-trash',
        command: () => this.deleteDiscount(this.targetDiscount),
      },
    ];
    return settingItem;
  }
  getDiscountList() {
    this.discountService.getDiscountList().subscribe({
      next: (res: DiscountListDto[]) => {
        this.discounts = res;
        console.log(this.discounts);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({
          summary: 'Something Error!',
          detail: 'Please try again.',
          severity: 'warn',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }
  updateDiscountProduct(discount: DiscountListDto) {
    this.returnUrl = this.router.url;
    this.router.navigate(['/discount/' + discount.discountId + '/update'], {
      state: { saveProduct: discount },
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  cancelProductDiscount(product: DiscountProductDetailDto[]) {
    console.log(product);
    if (product.length == 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'กรุณาเลือกสินค้า',
        detail: 'กรุณาเลือกสินค้าที่จะทำการยกเลิกลดราคา',
      });
      return;
    }
    const productId: DiscountProductCancelDto = {
      productId: product.map((p) => p.productId),
      categoriesId: [],
    };
    this.confirmationService.confirm({
      message: `ต้องการจะปิดการลดราคาของสินค้าเหล่านี้หรือไม่`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.discountService.cancelDiscount(productId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ปิดการลดราคาเรียบร้อย',
              severity: 'success',
              detail: `สินค้าได้ถูกปิดการลดราคาแล้ว `,
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
          detail: 'ยกเลิกการลดราคา',
          life: 3000,
        });
      },
    });
  }
  valueChange() {
    this.getDiscountList();
  }
  logInfo() {
    console.log(this.selectedProducts);
  }
  deleteDiscount(discount: DiscountListDto) {
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบ  ${discount.discountName} `,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.discountService.deleteDiscount(discount.discountId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบสินค้าเรียบร้อย',
              severity: 'success',
              detail: `${discount.discountName} ถูกลบแล้ว `,
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
          detail: 'ยกเลิกการลบสินค้า',
          life: 3000,
        });
      },
    });
  }
}
