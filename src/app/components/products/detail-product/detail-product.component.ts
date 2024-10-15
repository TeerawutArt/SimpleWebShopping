import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { ProductService } from '../../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailDto } from '../../../shared/dtos/product-detail.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CartService } from '../../../shared/services/cart.service';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TabViewModule,
    CommonModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.css',
})
export class DetailProductComponent implements OnInit {
  tabs: { title: string; content: string }[] = [];
  quantity: number = 1;
  idProduct: string = '';
  product!: ProductDetailDto;
  rootImgUrl = environment.imageUrl;
  loading = false;
  curDate!: Date;
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.curDate = new Date();
    console.log(this.curDate);
    this.loading = true;
    this.idProduct = this.route.snapshot.params['id'] || null;
    this.getProductDetail();
  }
  getProductDetail() {
    this.productService.getProductDetail(this.idProduct).subscribe({
      next: (res: ProductDetailDto[]) => {
        this.product = res[0];
        // prettier-ignore
        if (this.product.isDiscounted) {
          this.product.discountStartDate = new Date(this.product.discountStartDate);
          this.product.discountEndDate = new Date(this.product.discountEndDate);
          this.product.discountEndDate.setFullYear(this.product.discountEndDate.getFullYear()+543) //แปลง คศ เป็น พศ (ไว้คำนวณ)
          this.product.remainTimeDay = this.productService.remainTime(this.product.discountEndDate).day
          this.product.remainTimeHour = this.productService.remainTime(this.product.discountEndDate).hour
          this.product.remainTimeMin = this.productService.remainTime(this.product.discountEndDate).minute
        }

        this.loading = false;
        console.log(this.product);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }
  buyProduct(productId: string) {
    var req = { productId: productId, quantity: this.quantity };
    this.cartService.AddProductCart(req).subscribe({
      next: (_) => {
        this.cartService.setUpdateCart(true);
        this.router.navigate(['cart']);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }
}
