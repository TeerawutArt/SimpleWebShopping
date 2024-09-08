import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { CategoryService } from '../../../shared/services/category.service';
import { ProductService } from '../../../shared/services/product.service';
import { ProductListDto } from '../../../shared/dtos/product-list.dto';
import { PickListModule } from 'primeng/picklist';
import { environment } from '../../../../environments/environment.development';
import { TooltipModule } from 'primeng/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoriesListDto } from '../../../shared/dtos/categories-list.dto';
import { CustomValidatorService } from '../../../shared/services/custom-validator.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CouponService } from '../../../shared/services/coupon.service';
import { CouponDto } from '../../../shared/dtos/coupon.dto';
import { CouponCreateDto } from '../../../shared/dtos/coupon-create.dto';

@Component({
  selector: 'app-coupon-update',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    CalendarModule,
    FileUploadModule,
    ConfirmDialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    MultiSelectModule,
    ToastModule,
    FormsModule,
    CheckboxModule,
    TooltipModule,
    PickListModule, //ลง npm i @angular/cdk ด้วย
  ],
  templateUrl: './coupon-update.component.html',
  styleUrl: './coupon-update.component.css',
})
export class CouponUpdateComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private couponService: CouponService,
    private confirmationService: ConfirmationService,
    private categoriesService: CategoryService /* private formBuilder: FormBuilder //ไว้ทำ category tag */,
    private router: Router,
    private customValidator: CustomValidatorService,
    private route: ActivatedRoute
  ) {}
  storedCoupon!: CouponDto;
  couponForm!: FormGroup;
  isAmountInvalid = false;
  isProcessing = false;
  IsDiscountPercent = false;
  minDate: Date | undefined;
  returnUrl = '';
  ngOnInit(): void {
    this.isProcessing = true;
    this.storedCoupon = window.history.state['saveProduct']; //ดึงข้อมูลจาก state(ที่ส่งมา) ใน history ของ browser (รีเฟชแล้วไม่หาย)
    this.couponForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      couponRate: new FormControl('', [Validators.required]),
      discountPercent: new FormControl(this.storedCoupon.isDiscountPercent),
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      code: new FormControl('', [Validators.required]),
      maxDiscount: new FormControl(0, [Validators.required]),
      minPrice: new FormControl(0, [Validators.required]),
    });

    // prettier-ignore
    this.couponForm.get('endDate')?.addValidators(this.customValidator.endDateInvalid(this.couponForm.get('startDate')!));
    this.couponForm
      .get('startDate')
      ?.addValidators(
        this.customValidator.startDateInvalid(this.couponForm.get('endDate')!)
      );
    // prettier-ignore
    if (this.storedCoupon) {
      
      console.log(this.storedCoupon)
      this.couponForm.get('name')?.setValue(this.storedCoupon.couponName)
      this.couponForm.get('description')?.setValue(this.storedCoupon.description);
      this.couponForm.get('couponRate')?.setValue(this.storedCoupon.discountRate);
      this.minDate = new Date(this.storedCoupon.startTime); //เซ็ตค่าวันเงื่อนไขวันต่ำสุดที่เลือกได้ด้วย
      this.couponForm.get('startDate')?.setValue(new Date (this.storedCoupon.startTime));
      this.couponForm.get('endDate')?.setValue(new Date(this.storedCoupon.endTime));
      this.couponForm.get('amount')?.setValue(this.storedCoupon.amount),
      this.couponForm.get('code')?.setValue(this.storedCoupon.couponCode),
      this.couponForm.get('maxDiscount')?.setValue(this.storedCoupon.maxDiscount),
      this.couponForm.get('minPrice')?.setValue(this.storedCoupon.minimumPrice),
      this.IsDiscountPercent = this.storedCoupon.isDiscountPercent;
      this.isProcessing = false;
    }
  }
  checkedBox() {
    this.IsDiscountPercent = !this.IsDiscountPercent;
  }
  onSelectDate(event: Date) {
    const selectedStartDate = {
      day: event.getDate(),
      month: event.getMonth(),
      year: event.getFullYear(),
    };
    this.minDate = new Date();
    this.minDate.setDate(selectedStartDate.day);
    this.minDate.setMonth(selectedStartDate.month);
    this.minDate.setFullYear(selectedStartDate.year);
  }

  validateControl(controlName: string) {
    const control = this.couponForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  hasError(controlName: string, errorName: string) {
    const control = this.couponForm.get(controlName);
    return control?.hasError(errorName);
  }
  cancel() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }

  updateCoupon() {
    this.couponForm.disable();
    this.messageService.clear();
    this.isProcessing = true;
    const req: CouponCreateDto = {
      couponName: this.couponForm.get('name')?.value,
      description: this.couponForm.get('description')?.value,
      startTime: this.couponForm.get('startDate')?.value,
      endTime: this.couponForm.get('endDate')?.value,
      discountRate: this.couponForm.get('couponRate')?.value,
      amount: this.couponForm.get('amount')?.value,
      couponCode: this.couponForm.get('code')?.value,
      maxDiscount: this.couponForm.get('maxDiscount')?.value,
      minimumPrice: this.couponForm.get('minPrice')?.value,
      isDiscountPercent: this.IsDiscountPercent,
    };
    this.confirmationService.confirm({
      message: `คุณกำลังจะแก้ไข  ${this.storedCoupon.couponName} `,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.couponService
          .updateCoupon(this.storedCoupon.couponId, req)
          .subscribe({
            next: (_) => {
              this.messageService.add({
                summary: 'อัปเดทเรียบร้อยแล้ว',
                severity: 'success',
                detail: `${this.storedCoupon.couponName} ถูกอัปเดทแล้ว `,
              });
              setTimeout(() => {
                this.router.navigate(['/coupon/list']);
              }, 500);
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
          detail: 'ยกเลิกการอัปเดท',
          life: 3000,
        });
      },
    });
  }
}
