import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { CategoryService } from '../../../shared/services/category.service';
import { ProductService } from '../../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListDto } from '../../../shared/dtos/product-list.dto';
import { CategoriesListDto } from '../../../shared/dtos/categories-list.dto';

@Component({
  selector: 'app-update-product',
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
  ],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
})
export class UpdateProductComponent implements OnInit {
  @ViewChild(FileUpload) fileUploadComponent!: FileUpload;
  categoriesItem!: MenuItem[];
  productName: string = '';
  productForm!: FormGroup;
  isProcessing = false;
  uploadImage: File | string = '';
  minDate: Date | undefined;
  categoriesId: [] = [];
  idProduct = '';
  storedProduct!: ProductListDto;
  categories!: CategoriesListDto[];
  returnUrl = '';
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private categoriesService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    // prettier-ignore

    this.storedProduct = window.history.state['saveProduct']; //ดึงข้อมูลจาก state(ที่ส่งมา) ใน history ของ browser (รีเฟชแล้วไม่หาย)
    console.log(this.storedProduct);
    this.idProduct = this.route.snapshot.params['id'] || null;
    this.getCategories();
    this.productForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      productAmount: new FormControl('', [Validators.required]),
      productPrice: new FormControl('', [Validators.required]),
      selectedCategories: new FormControl<CategoriesListDto[]>([]),
    });
    this.productForm.get('name')?.setValue(this.storedProduct.productName);
    this.productForm
      .get('description')
      ?.setValue(this.storedProduct.description);
    this.productForm
      .get('productAmount')
      ?.setValue(this.storedProduct.productTotalAmount);
    this.productForm.get('productPrice')?.setValue(this.storedProduct.price);
    // prettier-ignore
    this.productForm.get('selectedCategories')?.setValue(this.storedProduct.categories);
  }

  validateControl(controlName: string) {
    const control = this.productForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  hasError(controlName: string, errorName: string) {
    const control = this.productForm.get(controlName);
    return control?.hasError(errorName);
  }
  onRemoveImage(product: FileRemoveEvent) {
    this.uploadImage = '';
  }
  onSelectImage(product: FileSelectEvent) {
    this.uploadImage = product.files[0];
  }
  onClearImage() {
    this.uploadImage = '';
  }
  getCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }
  cancel() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }
  updateProduct() {
    this.productName = this.productForm.get('name')?.value;
    this.confirmationService.confirm({
      header: 'ยืนยันการสร้างสินค้า',
      message: `กำลังจะแก้ไขสินค้า ${this.productName}`,
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.isProcessing = true;
        this.productForm.disable();
        // prettier-ignore
        this.categoriesId = this.productForm
          .get('selectedCategories')
          ?.value.map((c: any) => c.id);
        this.productService
          .updateProduct(
            {
              name: this.productForm.get('name')?.value,
              description: this.productForm.get('description')?.value,
              productAmount: this.productForm.get('productAmount')?.value,
              price: this.productForm.get('productPrice')?.value,
              CategoryId: this.categoriesId,
            },
            this.uploadImage,
            this.idProduct
          )
          .subscribe({
            next: (_) => {
              this.productForm.reset();
              this.messageService.clear();
              this.productForm.enable();
              this.fileUploadComponent.clear(); //ล้างไฟล์เมื่อดำเนินการแล้ว
              this.isProcessing = false;
              this.messageService.add({
                summary: 'แก้ไขสินค้าสำเร็จ',
                detail: `สินค้า ${this.productName} ถูกแก้ไขแล้ว`,
                severity: 'success',
                life: 2000,
              });
              this.router.navigate(['/product/list']);
            },
            error: (err: HttpErrorResponse) => {
              this.messageService.add({
                summary: 'Something Error!',
                detail: 'Please try again.',
                severity: 'warn',
              });
              this.productForm.enable();
              this.isProcessing = false;
            },
          });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการแก้ไขสินค้า',
          life: 1000,
        });
      },
    });
  }
}
