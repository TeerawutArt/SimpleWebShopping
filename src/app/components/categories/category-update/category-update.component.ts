import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CategoryService } from '../../../shared/services/category.service';
import { CategoryUpdateDto } from '../../../shared/dtos/category-update.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesListDto } from '../../../shared/dtos/categories-list.dto';

@Component({
  selector: 'app-category-update',
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
    ConfirmDialogModule,
    FormsModule,
  ],
  templateUrl: './category-update.component.html',
  styleUrl: './category-update.component.css',
})
export class CategoryUpdateComponent implements OnInit {
  loading: boolean = false;
  categoryForm!: FormGroup;
  storedCategory!: CategoriesListDto;
  returnUrl = '';
  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.storedCategory = window.history.state['saveProduct']; //ดึงข้อมูลจาก state(ที่ส่งมา) ใน history ของ browser (รีเฟชแล้วไม่หาย)
    this.categoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      codeName: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
    if (this.storedCategory) {
      this.setFormValue();
    }
  }
  setFormValue() {
    this.categoryForm.get('name')?.setValue(this.storedCategory.name);
    this.categoryForm.get('codeName')?.setValue(this.storedCategory.code);
    this.categoryForm
      .get('description')
      ?.setValue(this.storedCategory.description);
  }

  validateControl(controlName: string) {
    const control = this.categoryForm.get(controlName);
    return control?.invalid && control?.touched;
  }
  cancel() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }
  hasError(controlName: string, errorName: string) {
    const control = this.categoryForm.get(controlName);
    return control?.hasError(errorName);
  }
  updateCategory() {
    this.loading = true;
    this.categoryForm.disable();
    this.messageService.clear();
    this.loading = true;
    const req: CategoryUpdateDto = {
      name: this.categoryForm.get('name')?.value,
      codeName: this.categoryForm.get('codeName')?.value,
      description: this.categoryForm.get('description')?.value,
    };
    this.categoryService.updateCategory(this.storedCategory.id, req).subscribe({
      next: (_) => {
        this.messageService.add({
          severity: 'success',
          summary: 'ทำรายการสำเร็จ',
          detail: 'แก้ไขหมวดหมู่สินค้าเรียบร้อยแล้ว',
        });
        this.loading = false;
        this.categoryForm.enable();
        setTimeout(() => {
          this.router.navigate(['/category/list']);
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.categoryForm.enable();
        this.messageService.add({
          severity: 'error',
          summary: 'ทำรายการไม่สำเร็จ',
          detail: err.message,
          sticky: true,
        });
        this.loading = false;
      },
    });
  }
}
