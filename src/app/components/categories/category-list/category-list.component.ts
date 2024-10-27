import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  LazyLoadMeta,
} from 'primeng/api';
import { DiscountService } from '../../../shared/services/discount.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { ToolbarModule } from 'primeng/toolbar';
import { HttpErrorResponse } from '@angular/common/http';
import { CouponDto } from '../../../shared/dtos/coupon.dto';
import { CategoryService } from '../../../shared/services/category.service';
import { CategoriesListDto } from '../../../shared/dtos/categories-list.dto';
import { PagingDto } from '../../../shared/dtos/paging.dto';

@Component({
  selector: 'app-category-list',
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
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  @ViewChild('pt') pt!: Table;
  returnUrl = '';
  menuItems!: MenuItem[];
  categories: CategoriesListDto[] = [];
  selectedCategory: CategoriesListDto[] = [];
  keyword: string = '';
  pageIndex = 1;
  pageSize = 10;
  pageSizeSelected = new Array();
  totalRecords = 0;
  loading: boolean = false;

  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}
  ngOnInit(): void {}

  onFilter(pt: Table, event: any) {
    if (
      event.code === 'Enter' ||
      (event.code === 'NumpadEnter' && this.keyword)
    )
      this.getAllCategories(pt);
  }
  getAllCategories(e: LazyLoadMeta) {
    this.pageIndex = Math.floor(e.first! / e.rows!) + 1;
    this.pageSize = e.rows!;
    this.loading = true;
    this.categoryService
      .getCategoriesWithKeyword(this.keyword, this.pageIndex, this.pageSize)
      .subscribe({
        next: (res: PagingDto<CategoriesListDto>) => {
          this.categories = res.items;
          this.totalRecords = res.totalRecords;
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
  newCategory() {
    this.returnUrl = this.router.url;
    this.router.navigate(['/category/new'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  updateCategory(category: CategoriesListDto) {
    this.returnUrl = this.router.url;
    this.router.navigate(['/category/' + category.id + '/update'], {
      state: { saveProduct: category },
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  deleteCategory(item: CategoriesListDto) {
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบคูปอง "${item.name}"`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoryService.deleteCategory(item.id).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบคูปองเรียบร้อย',
              severity: 'success',
              detail: `หมวดหมู่ "${item.name}" ถูกลบแล้ว`,
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
          detail: 'ยกเลิกการลบหมวดหมู่',
          life: 3000,
        });
      },
    });
  }
  valueChange() {
    this.pt.reset();
  }

  deleteSelectCategory() {
    const selectedCategoryIds = this.selectedCategory.map((sc) => sc.id);
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบคูปองจำนวน ${selectedCategoryIds.length} ชิ้น`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoryService
          .deleteSelectedCategory(selectedCategoryIds)
          .subscribe({
            next: (_) => {
              this.messageService.add({
                summary: 'ทำรายการเรียบร้อย',
                severity: 'success',
                detail: `หมวดหมู่จำนวน ${selectedCategoryIds.length} หมวดหมู่ถูกลบแล้ว `,
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
          detail: 'ยกเลิกการลบหมวดหมู่',
          life: 3000,
        });
      },
    });
  }
}
