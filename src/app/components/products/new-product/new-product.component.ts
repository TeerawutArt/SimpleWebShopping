import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProductService } from '../../../shared/services/product.service';
import { CategoryService } from '../../../shared/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-product',
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
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent {
  @ViewChild(FileUpload) fileUploadComponent!: FileUpload;
  categoriesItem!: MenuItem[];
  productName: string = '';
  productForm!: FormGroup;
  isProcessing = false;
  uploadImage: File | string = '';
  minDate: Date | undefined;
  isProductAmountInvalid = false;
  categoriesId: [] = [];
  dateNow!: Date;
  returnUrl = '';
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private categoriesService: CategoryService /* private formBuilder: FormBuilder //ไว้ทำ category tag */,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.getCategories();
    this.productForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      productAmount: new FormControl('', [Validators.required]),
      productPrice: new FormControl('', [Validators.required]),
      categories: new FormControl(''),
      /*       categories: new FormArray([]), */
    });
  }
  //dynamic Form
  /*   get categories() {
    //ใช้ getter
    return this.productForm.controls['categories'] as FormArray;
  }
  addCategoryField() {
    this.categories.push(new FormControl(''));
    console.log(this.categories);
  }
  removeCategoryField(index: number) {
    this.categories.removeAt(index);
  }
 */
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
        console.log(res);
        this.categoriesItem = res;
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
  createdProduct() {
    if (this.productForm.get('productAmount')?.value == 0) {
      this.isProductAmountInvalid = true;
    } else {
      // prettier-ignore
      if(this.categoriesId.length>0) {
              this.categoriesId = this.productForm
                .get('categories')
                ?.value.map((c: any) => c.id);
      }
      this.productName = this.productForm.get('name')?.value;
      this.confirmationService.confirm({
        header: 'ยืนยันการสร้างสินค้า',
        message: `สร้างสินค้า ${this.productName}`,
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
          this.productService
            .createProduct(
              {
                name: this.productName,
                description: this.productForm.get('description')?.value,
                productAmount: this.productForm.get('productAmount')?.value,
                price: this.productForm.get('productPrice')?.value,
                CategoryId: this.categoriesId,
              },
              this.uploadImage
            )
            .subscribe({
              next: (_) => {
                this.productForm.reset();
                this.messageService.clear();
                this.productForm.enable();
                this.fileUploadComponent.clear(); //ล้างไฟล์เมื่อดำเนินการแล้ว
                this.isProcessing = false;
                this.messageService.add({
                  summary: 'สร้างสินค้าสำเร็จ',
                  detail: `สินค้า ${this.productName} ถูกสร้างแล้ว`,
                  severity: 'success',
                  life: 2000,
                });
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
            detail: 'ยกเลิกการสร้างสินค้า',

            life: 1000,
          });
        },
      });
    }
  }
}
