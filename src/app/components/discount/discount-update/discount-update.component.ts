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
import { ProductCreateDiscountDto } from '../../../shared/dtos/product-create-discount.dto';
import { DiscountService } from '../../../shared/services/discount.service';
import { DiscountListDto } from '../../../shared/dtos/discount-list.dto';
import { DiscountProductDetailDto } from '../../../shared/dtos/discount-product-detail';
import { ToastModule } from 'primeng/toast';
import { DiscountUpdateDto } from '../../../shared/dtos/discount-update.dto';

@Component({
  selector: 'app-discount-update',
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
  templateUrl: './discount-update.component.html',
  styleUrl: './discount-update.component.css',
})
export class DiscountUpdateComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private discountService: DiscountService,
    private confirmationService: ConfirmationService,
    private categoriesService: CategoryService /* private formBuilder: FormBuilder //ไว้ทำ category tag */,
    private router: Router,
    private customValidator: CustomValidatorService,
    private route: ActivatedRoute
  ) {}
  storedDiscount!: DiscountListDto;
  sourceProducts!: DiscountProductDetailDto[];
  targetProducts!: DiscountProductDetailDto[];
  sourceCategories!: CategoriesListDto[];
  targetCategories!: CategoriesListDto[];
  productDiscountForm!: FormGroup;
  isProcessing = false;
  pickMode = '';
  minDate: Date | undefined;
  isProductAmountInvalid = false;
  categoriesId: string[] = [];
  productsId: string[] = [];
  rootImgUrl = environment.imageUrl;
  returnUrl = '';
  IsDiscountPercent = false;
  ngOnInit(): void {
    this.sourceProducts = [];
    this.targetCategories = [];
    this.isProcessing = true;
    this.storedDiscount = window.history.state['saveProduct']; //ดึงข้อมูลจาก state(ที่ส่งมา) ใน history ของ browser (รีเฟชแล้วไม่หาย)
    this.productDiscountForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      discountRate: new FormControl('', [Validators.required]),
      discountPercent: new FormControl(this.storedDiscount.isDiscountPercent),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });

    // prettier-ignore
    this.productDiscountForm.get('endDate')?.addValidators(this.customValidator.endDateInvalid(this.productDiscountForm.get('startDate')!));
    this.productDiscountForm
      .get('startDate')
      ?.addValidators(
        this.customValidator.startDateInvalid(
          this.productDiscountForm.get('endDate')!
        )
      );
    // prettier-ignore
    if (this.storedDiscount) {
      console.log(this.storedDiscount)
      console.log(this.productDiscountForm)
      this.pickMode = 'Products';
      this.productDiscountForm.get('name')?.setValue(this.storedDiscount.discountName)
      this.productDiscountForm.get('description')?.setValue(this.storedDiscount.description);
      this.productDiscountForm.get('discountRate')?.setValue(this.storedDiscount.discountRate);
      this.IsDiscountPercent = this.storedDiscount.isDiscountPercent      
      this.targetProducts = this.storedDiscount.discountProduct;
      this.minDate = new Date(this.storedDiscount.startTime); //เซ็ตค่าวันเงื่อนไขวันต่ำสุดที่เลือกได้ด้วย
      this.productDiscountForm.get('startDate')?.setValue(new Date (this.storedDiscount.startTime));
      this.productDiscountForm.get('endDate')?.setValue(new Date(this.storedDiscount.endTime));

      this.isProcessing = false;
    } else {
      this.pickMode = 'Categories';
      this.getCategories();
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
  getCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (res) => {
        this.sourceCategories = res;
        this.isProcessing = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }
  validateControl(controlName: string) {
    const control = this.productDiscountForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  hasError(controlName: string, errorName: string) {
    const control = this.productDiscountForm.get(controlName);
    return control?.hasError(errorName);
  }
  cancel() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }

  updateDiscount() {
    this.productDiscountForm.disable();
    this.messageService.clear();
    this.isProcessing = true;
    if (this.targetCategories?.length > 0) {
      this.categoriesId = this.targetCategories.map((c) => c.id);
    }
    if (this.targetProducts?.length > 0) {
      this.productsId = this.targetProducts.map((p) => p.productId);
    }
    const req: DiscountUpdateDto = {
      discountName: this.productDiscountForm.get('name')?.value,
      discountDescription: this.productDiscountForm.get('description')?.value,
      discountRate: this.productDiscountForm.get('discountRate')?.value,
      isDiscountPercent: this.IsDiscountPercent,
      startTime: this.productDiscountForm.get('startDate')?.value,
      endTime: this.productDiscountForm.get('endDate')?.value,
      categoriesId: this.categoriesId,
      productId: this.productsId,
    };
    this.confirmationService.confirm({
      message: `คุณกำลังจะแก้ไข  ${this.storedDiscount.discountName} `,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.discountService
          .updateDiscount(this.storedDiscount.discountId, req)
          .subscribe({
            next: (_) => {
              this.messageService.add({
                summary: 'อัปเดทเรียบร้อยแล้ว',
                severity: 'success',
                detail: `${this.storedDiscount.discountName} ถูกอัปเดทแล้ว `,
              });
              setTimeout(() => {
                this.router.navigate(['/discount/list']);
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
