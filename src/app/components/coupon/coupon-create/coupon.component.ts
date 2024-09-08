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
import { CouponService } from '../../../shared/services/coupon.service';
import { CouponCreateDto } from '../../../shared/dtos/coupon-create.dto';

@Component({
  selector: 'app-coupon',
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
    FormsModule,
    CheckboxModule,
    TooltipModule,
    PickListModule, //ลง npm i @angular/cdk ด้วย
  ],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.css',
})
export class CouponComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private router: Router,
    private customValidator: CustomValidatorService,
    private route: ActivatedRoute,
    private couponService: CouponService
  ) {}

  couponForm!: FormGroup;
  isAmountInvalid = false;
  isProcessing = false;
  IsDiscountPercent = false;
  minDate: Date | undefined;
  dateNow!: Date;
  returnUrl = '';
  ngOnInit(): void {
    this.dateNow = new Date();
    this.minDate = new Date();

    this.couponForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      couponRate: new FormControl('', [Validators.required]),
      discountPercent: new FormControl(this.IsDiscountPercent),
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      code: new FormControl('', [Validators.required]),
      maxDiscount: new FormControl(0, [Validators.required]),
      minPrice: new FormControl(0, [Validators.required]),
    });
    // prettier-ignore
    this.couponForm.get('endDate')?.addValidators(this.customValidator.endDateInvalid(this.couponForm.get('startDate')!));
    this.couponForm.get('startDate')?.addValidators(this.customValidator.startDateInvalid(this.couponForm.get('endDate')!));
    // prettier-ignore
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
  createCouponProduct() {
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
    console.log(req);
    this.couponService.createCoupon(req).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'ทำรายการสำเร็จ',
          detail: 'สร้างคูปองเรียบร้อยแล้ว',
        });
        this.isProcessing = false;
        this.couponForm.enable();
        setTimeout(() => {
          this.router.navigate(['/coupon/list']);
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.couponForm.enable();
        this.messageService.add({
          severity: 'error',
          summary: 'ทำรายการไม่สำเร็จ',
          detail: err.message,
          sticky: true,
        });
        this.isProcessing = false;
      },
    });
  }
}
