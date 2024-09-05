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

@Component({
  selector: 'app-discount',
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
  templateUrl: './discount.component.html',
  styleUrl: './discount.component.css',
})
export class DiscountComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private discountService: DiscountService,

    private categoriesService: CategoryService /* private formBuilder: FormBuilder //ไว้ทำ category tag */,
    private router: Router,
    private customValidator: CustomValidatorService,
    private route: ActivatedRoute
  ) {}
  storedProduct: ProductListDto[] = [];
  sourceProducts!: ProductListDto[];
  targetProducts!: ProductListDto[];
  sourceCategories!: CategoriesListDto[];
  targetCategories!: CategoriesListDto[];
  productDiscountForm!: FormGroup;
  isProcessing = false;
  pickMode = '';
  uploadImage: File | string = '';
  minDate: Date | undefined;
  isProductAmountInvalid = false;
  categoriesId: string[] = [];
  productsId: string[] = [];
  dateNow!: Date;
  rootImgUrl = environment.imageUrl;
  returnUrl = '';
  IsDiscountPercent = false;
  ngOnInit(): void {
    this.dateNow = new Date();
    this.minDate = new Date();
    this.sourceProducts = [];
    this.targetCategories = [];
    this.isProcessing = true;
    this.storedProduct = window.history.state['saveProduct']; //ดึงข้อมูลจาก state(ที่ส่งมา) ใน history ของ browser (รีเฟชแล้วไม่หาย)
    if (this.storedProduct?.length > 0) {
      this.pickMode = 'Products';
      this.targetProducts = this.storedProduct;
      this.isProcessing = false;
      console.log(this.storedProduct);
    } else {
      this.pickMode = 'Categories';
      this.getCategories();
    }
    this.productDiscountForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      discountRate: new FormControl('', [Validators.required]),
      discountPercent: new FormControl(this.IsDiscountPercent),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      /*       categories: new FormArray([]), */
    });
    // prettier-ignore
    this.productDiscountForm.get('endDate')?.addValidators(this.customValidator.endDateInvalid(this.productDiscountForm.get('startDate')!));
    this.productDiscountForm.get('startDate')?.addValidators(this.customValidator.startDateInvalid(this.productDiscountForm.get('endDate')!));
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
  createDiscountProduct() {
    this.productDiscountForm.disable();
    this.messageService.clear();
    this.isProcessing = true;
    if (this.targetCategories?.length > 0) {
      this.categoriesId = this.targetCategories.map((c) => c.id);
    }
    if (this.targetProducts?.length > 0) {
      this.productsId = this.targetProducts.map((p) => p.productId);
    }
    const req: ProductCreateDiscountDto = {
      discountName: this.productDiscountForm.get('name')?.value,
      discountDescription: this.productDiscountForm.get('description')?.value,
      startTime: this.productDiscountForm.get('startDate')?.value,
      endTime: this.productDiscountForm.get('endDate')?.value,
      discountRate: this.productDiscountForm.get('discountRate')?.value,
      isDiscountPercent: this.IsDiscountPercent,
      categoriesId: this.categoriesId,
      productId: this.productsId,
    };
    console.log(req);
    this.discountService.createDiscountProduct(req).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลดราคาเรียบร้อย',
          detail: 'สินค้าถูกลดราคาแล้ว',
        });
        this.isProcessing = false;
        this.productDiscountForm.enable();
        setTimeout(() => {
          this.router.navigate(['/product/list']);
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.productDiscountForm.enable();
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
