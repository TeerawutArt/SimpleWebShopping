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
import { CategoryCreateDto } from '../../../shared/dtos/category-create.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-create',
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
  templateUrl: './category-create.component.html',
  styleUrl: './category-create.component.css',
})
export class CategoryCreateComponent implements OnInit {
  loading: boolean = false;
  categoryForm!: FormGroup;
  returnUrl = '';
  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.categoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      codeName: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
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
  createCategory() {
    this.loading = true;
    this.categoryForm.disable();
    this.messageService.clear();
    this.loading = true;
    const req: CategoryCreateDto = {
      name: this.categoryForm.get('name')?.value,
      codeName: this.categoryForm.get('codeName')?.value,
      description: this.categoryForm.get('description')?.value,
    };
    this.categoryService.createCategory(req).subscribe({
      next: (_) => {
        this.messageService.add({
          severity: 'success',
          summary: 'ทำรายการสำเร็จ',
          detail: 'สร้างหมวดหมู่สินค้าใหม่เรียบร้อยแล้ว',
          life: 1000,
        });
        this.categoryForm.enable();
        setTimeout(() => {
          this.loading = false;
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
