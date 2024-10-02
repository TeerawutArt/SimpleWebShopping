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
import { ProductService } from '../../../shared/services/product.service';
import { PagingDto } from '../../../shared/dtos/paging.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ProductListDto } from '../../../shared/dtos/product-list.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { CutTextPipe } from '../../../shared/pipe/cut-text.pipe';

@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.css',
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
    CutTextPipe,
  ],
  providers: [MessageService, ConfirmationService, ProductService],
})
export class ManageProductsComponent implements OnInit {
  productDialog: boolean = false;

  cols!: unknown[];
  products!: ProductListDto[];
  returnUrl = '';
  product!: ProductListDto;
  rootImgUrl = environment.imageUrl;
  selectedProducts: ProductListDto[] = [];
  manageProductMode = true;
  submitted: boolean = false;
  HideDisableProduct = false;
  statuses!: any[];
  keyword: string = '';
  pageIndex = 1;
  pageSize = 10;
  pageSizeSelected = new Array();
  totalRecords = 0;
  loading: boolean = false;
  @ViewChild('pt') pt!: Table;
  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  onSort() {
    console.log('sort');
  }

  ngOnInit() {
    this.pageSizeSelected = [10, 25, 50];
    this.statuses = [
      { label: 'INSTOCK', value: 'มีสินค้า' },
      { label: 'LOWSTOCK', value: 'สินค้าใกล้หมด' },
      { label: 'OUTOFSTOCK', value: 'สินค้าหมด' },
    ];
  }
  newProduct() {
    this.returnUrl = this.router.url;
    this.router.navigate(['/product/new'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  updateProduct(curProduct: ProductListDto) {
    this.returnUrl = this.router.url;
    this.router.navigate(['/product/' + curProduct.productId + '/update'], {
      state: { saveProduct: curProduct },
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  discountProduct(selectedProduct: ProductListDto[]) {
    if (selectedProduct.length == 0) return;
    this.messageService.clear();
    const filterProductsNotDiscount = selectedProduct.filter(
      (p) => p.isDiscounted == false
    );
    if (filterProductsNotDiscount.length === 0) {
      this.messageService.add({
        summary: 'ไม่สามารถลดราคาได้',
        severity: 'warn',
        detail:
          'ลดราคาสินค้าที่ลดราคาอยู่แล้วไม่ได้<br>กรุณายกเลิกการลดราคาก่อน',
        life: 5000,
      });
      return;
    }
    const discountProducts = filterProductsNotDiscount.map((p) => ({
      productId: p.productId,
      productImageURL: p.productImageURL,
      productName: p.productName,
      categories: p.categories,
      price: p.price,
    }));
    this.returnUrl = this.router.url;
    this.router.navigate(['/discount/products'], {
      state: { saveProduct: discountProducts },
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  discountProductCategories() {
    this.returnUrl = this.router.url;
    this.router.navigate(['/discount/products'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }

  onFilter(pt: Table, event: any) {
    if (
      event.code === 'Enter' ||
      (event.code === 'NumpadEnter' && this.keyword)
    )
      this.getAllProduct(pt);
  }
  getAllProduct(e: LazyLoadMeta) {
    console.log(e.sortField); //ค่อยทำ
    console.log(e.sortOrder);
    this.pageIndex = Math.floor(e.first! / e.rows!) + 1;
    this.pageSize = e.rows!;
    this.loading = true;

    this.productService
      .getAllProduct(
        this.manageProductMode,
        this.keyword,
        this.pageIndex,
        this.pageSize,
        this.HideDisableProduct
      )
      .subscribe({
        next: (res: PagingDto<ProductListDto>) => {
          this.products = res.items;
          this.totalRecords = res.totalRecords;
          // prettier-ignore
          this.products.forEach((e) => {
            //แปลงเวลากลับมาเป็น type Date (data ส่งมาเป็น string) และแปลง ค.ศ.เป็น พ.ศ ไปในตัว วิธีนี้ไม่ดี แต่ใช้ไปก่อนง่ายดี
            e.discountStartDate = new Date(e.discountStartDate);
            e.discountStartDate.setFullYear(e.discountStartDate.getFullYear()+543) 
            e.discountEndDate = new Date(e.discountEndDate); 
            e.discountEndDate.setFullYear(e.discountEndDate.getFullYear()+543) 
            e.remainTimeDay = this.productService.remainTime(e.discountEndDate).day;
            e.remainTimeHour = this.productService.remainTime(e.discountEndDate).hour;
            e.remainTimeMin = this.productService.remainTime(e.discountEndDate).minute;
            if(!e.isAvailable){
              e.inventoryStatus = "ระงับการขาย"
            }else if(e.isDiscounted){
              e.inventoryStatus = 'ลดราคา';
            }else{
              e.inventoryStatus =
                e.productTotalAmount > 0 ? 'มีสินค้า' : 'สินค้าหมด';  
            }
            

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
  deleteProduct(item: ProductListDto) {
    this.confirmationService.confirm({
      message: 'คุณกำลังจะลบสินค้า ' + '"' + item.productName + '"',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.deleteProduct(item.productId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบสินค้าเรียบร้อย',
              severity: 'success',
              detail: 'สินค้า' + '"' + item.productName + '"' + ' ถูกลบแล้ว',
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
          detail: 'ยกเลิกการลบสินค้า',
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
      case 'มีสินค้า':
        return 'success';
      case 'สินค้าหมด':
        return 'danger';
      case 'ระงับการขาย':
        return 'danger';
      case 'ลดราคา':
        return 'info';
    }
    return 'contrast';
  }
  deleteSelectProducts() {
    const selectedProductIds = this.selectedProducts.map((sp) => sp.productId);
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบสินค้าจำนวน ${selectedProductIds.length} ชิ้น`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService
          .deleteSelectedProducts(selectedProductIds)
          .subscribe({
            next: (_) => {
              this.messageService.add({
                summary: 'ลบสินค้าเรียบร้อย',
                severity: 'success',
                detail: `สินค้าจำนวน ${selectedProductIds.length} ชิ้น ถูกลบแล้ว `,
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
          detail: 'ยกเลิกการลบสินค้า',
          life: 3000,
        });
      },
    });
  }
  changeProductAvailable(product: ProductListDto) {
    let messageConfirm = '';
    product.isAvailable
      ? (messageConfirm = 'คุณกำลังจะปิดการขายสินค้า')
      : (messageConfirm = 'คุณกำลังเปิดขายสินค้า');
    this.confirmationService.confirm({
      message: `${messageConfirm} "${product.productName}"`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService
          .changeProductAvailable(product.productId, {
            isAvailable: !product.isAvailable,
          })
          .subscribe({
            next: (_) => {
              if (product.isAvailable) {
                this.messageService.add({
                  summary: 'ระงับสินค้าเรียบร้อยแล้ว',
                  severity: 'success',
                  detail: `สินค้า "${product.productName} ถูกระงับแล้ว"`,
                });
              } else {
                this.messageService.add({
                  summary: 'เปิดขายสินค้าเรียบร้อยแล้ว',
                  severity: 'success',
                  detail: `สินค้า "${product.productName} เปิดขายอีกครั้ง"`,
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
