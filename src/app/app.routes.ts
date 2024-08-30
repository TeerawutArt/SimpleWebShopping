import { Routes } from '@angular/router';

import { authGuard } from './shared/guards/auth.guard';

import { AccountRegisterUserComponent } from './components/account-register-user/account-register-user.component';
import { ProductsComponent } from './components/products/all-product/products.component';
import { NewProductComponent } from './components/products/new-product/new-product.component';
import { NotifyNewsComponent } from './components/notify-news/notify-news.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { isLoginGuard } from './shared/guards/islogin.guard';
import { UpdateProductComponent } from './components/products/update-product/update-product.component';

export const routes: Routes = [
  {
    path: 'account',
    children: [
      {
        path: 'register',
        title: 'Register',
        component: AccountRegisterUserComponent,
      },
    ],
  },
  {
    path: 'product',
    children: [
      {
        path: 'list',
        title: 'สินค้า',
        component: ProductsComponent,
      },
      {
        path: 'new',
        title: 'สร้างสินค้า',
        component: NewProductComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id/update',
        title: 'แก้ไขสินค้า',
        component: UpdateProductComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'news',
    title: 'ข่าวสาร',
    component: NotifyNewsComponent,
  },
  {
    path: 'forbidden',
    title: 'ไม่พบสิทธิ์',
    component: ForbiddenComponent,
    canActivate: [isLoginGuard],
  },
];
