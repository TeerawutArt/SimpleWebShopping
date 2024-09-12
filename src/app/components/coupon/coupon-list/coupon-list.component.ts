import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadMeta, MessageService } from 'primeng/api';
import { Table, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CouponService } from '../../../shared/services/coupon.service';
import { PagingDto } from '../../../shared/dtos/paging.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { CouponDto } from '../../../shared/dtos/coupon.dto';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrl: './coupon-list.component.css',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    RippleModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextModule,
    InputTextareaModule,
    CommonModule,
    FileUploadModule,
    DropdownModule,
    TagModule,
    RadioButtonModule,
    RatingModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
  ],
  providers: [MessageService, ConfirmationService, CouponService],
})
export class CouponListComponent implements OnInit {
  couponDialog: boolean = false;
  curDate!: Date;
  cols!: unknown[];
  coupons!: CouponDto[];
  returnUrl = '';
  coupon!: CouponDto;
  rootImgUrl = environment.imageUrl;
  selectedCoupons: CouponDto[] = [];
  submitted: boolean = false;
  HideDisableCoupon = false;
  statuses!: any[];
  keyword: string = '';
  pageIndex = 1;
  pageSize = 10;
  pageSizeSelected = new Array();
  totalRecords = 0;
  loading: boolean = false;
  @ViewChild('pt') pt!: Table;
  constructor(
    private couponService: CouponService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  onSort() {
    console.log('sort');
  }

  ngOnInit() {
    this.curDate = new Date();
    this.pageSizeSelected = [10, 25, 50];
    this.statuses = [
      { label: 'INSTOCK', value: 'มีคูปอง' },
      { label: 'LOWSTOCK', value: 'คูปองใกล้หมด' },
      { label: 'OUTOFSTOCK', value: 'คูปองหมด' },
    ];
  }
  newCoupon() {
    this.returnUrl = this.router.url;
    this.router.navigate(['/coupon/new'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  updateCoupon(curCoupon: CouponDto) {
    this.returnUrl = this.router.url;
    this.router.navigate(['/coupon/' + curCoupon.couponId + '/update'], {
      state: { saveProduct: curCoupon },
      queryParams: { returnUrl: this.returnUrl },
    });
  }

  onFilter(pt: Table, event: any) {
    if (
      event.code === 'Enter' ||
      (event.code === 'NumpadEnter' && this.keyword)
    )
      this.getAllCoupon(pt);
  }
  getAllCoupon(e: LazyLoadMeta) {
    console.log(e.sortField); //ค่อยทำ
    console.log(e.sortOrder);

    this.loading = true;

    this.couponService.getCouponList(this.keyword).subscribe({
      next: (res: CouponDto[]) => {
        this.coupons = res;
        // prettier-ignore
        this.coupons.forEach((e) => {
            if(!e.isCouponAvailable){
              e.status ="ระงับคูปอง";
            }else if (new Date(e.endTime) <= this.curDate) {
              e.status = 'หมดอายุ';
            } else {
              e.status = e.amount > 0 ? 'มีคูปอง' : 'คูปองหมด';
            }
                console.log(res);

          });
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
  deleteCoupon(item: CouponDto) {
    this.confirmationService.confirm({
      message: 'คุณกำลังจะลบคูปอง ' + '"' + item.couponName + '"',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.couponService.deleteCoupon(item.couponId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบคูปองเรียบร้อย',
              severity: 'success',
              detail: 'คูปอง' + '"' + item.couponName + '"' + ' ถูกลบแล้ว',
            });
            this.valueChange();
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
            this.valueChange();
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการลบคูปอง',
          life: 3000,
        });
      },
    });
  }
  valueChange() {
    this.pt.reset();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'มีคูปอง':
        return 'success';
      case 'คูปองหมด':
        return 'warning';
      case 'ระงับคูปอง':
        return 'danger';
    }
    return 'contrast';
  }
  deleteSelectCoupons() {
    const selectedCouponIds = this.selectedCoupons.map((sp) => sp.couponId);
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบคูปองจำนวน ${selectedCouponIds.length} ชิ้น`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.couponService.deleteSelectedCoupons(selectedCouponIds).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบคูปองเรียบร้อย',
              severity: 'success',
              detail: `คูปองจำนวน ${selectedCouponIds.length} ชิ้น ถูกลบแล้ว `,
            });
            this.valueChange();
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
            this.valueChange();
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการลบคูปอง',
          life: 3000,
        });
      },
    });
  }

  changeCouponAvailable(coupon: CouponDto) {
    let messageConfirm = '';
    coupon.isCouponAvailable
      ? (messageConfirm = 'คุณกำลังจะปิดการขายคูปอง')
      : (messageConfirm = 'คุณกำลังเปิดขายคูปอง');
    this.confirmationService.confirm({
      message: `${messageConfirm} "${coupon.couponName}"`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.couponService
          .changeCouponAvailable(coupon.couponId, {
            isAvailable: !coupon.isCouponAvailable,
          })
          .subscribe({
            next: (_) => {
              if (coupon.isCouponAvailable) {
                this.messageService.add({
                  summary: 'ระงับคูปองเรียบร้อยแล้ว',
                  severity: 'success',
                  detail: `คูปอง "${coupon.couponName} ถูกระงับแล้ว"`,
                });
              } else {
                this.messageService.add({
                  summary: 'เปิดขายคูปองเรียบร้อยแล้ว',
                  severity: 'success',
                  detail: `คูปอง "${coupon.couponName} เปิดขายอีกครั้ง"`,
                });
              }
              this.valueChange();
            },
            error: (error: HttpErrorResponse) => {
              this.messageService.add({
                summary: 'Something Error',
                severity: 'danger',
                detail: 'something error',
              });
              this.valueChange();
            },
          });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการดำเนินการ',
          life: 3000,
        });
      },
    });
  }
}
