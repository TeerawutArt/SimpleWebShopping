import { Routes } from '@angular/router';

import { authGuard } from './shared/guards/auth.guard';

import { AccountRegisterUserComponent } from './components/account-register-user/account-register-user.component';
import { ProductsComponent } from './components/products/all-product/products.component';
import { NewProductComponent } from './components/products/new-product/new-product.component';
import { NotifyNewsComponent } from './components/notify-news/notify-news.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { isLoginGuard } from './shared/guards/islogin.guard';
import { UpdateProductComponent } from './components/products/update-product/update-product.component';
import { ManageProductsComponent } from './components/products/manage-products/manage-products.component';
import { adminGuard } from './shared/guards/admin.guard';
import { DiscountComponent } from './components/discount/discount-create/discount.component';
import { DiscountListComponent } from './components/discount/discount-list/discount-list.component';
import { DiscountUpdateComponent } from './components/discount/discount-update/discount-update.component';
import { CartSelectProductComponent } from './components/cart/cart-select-product/cart-select-product.component';
import { CouponComponent } from './components/coupon/coupon-create/coupon.component';
import { CouponListComponent } from './components/coupon/coupon-list/coupon-list.component';
import { CouponUpdateComponent } from './components/coupon/coupon-update/coupon-update.component';
import { CategoryListComponent } from './components/categories/category-list/category-list.component';
import { CategoryUpdateComponent } from './components/categories/category-update/category-update.component';
import { CategoryCreateComponent } from './components/categories/category-create/category-create.component';
import { UserProfileComponent } from './components/profile/user-profile/user-profile.component';
import { CreateAddressComponent } from './components/profile/addresses/create-address/create-address.component';
import { UpdateAddressComponent } from './components/profile/addresses/update-address/update-address.component';
import { ConfirmOrderComponent } from './components/order/confirm-order/confirm-order.component';

export const routes: Routes = [
  {
    path: 'account',
    children: [
      {
        path: 'register',
        title: 'Register',
        component: AccountRegisterUserComponent,
      },
      {
        path: 'profile',
        title: 'Profile',
        component: UserProfileComponent,
        canActivate: [authGuard],
      },
      {
        path: 'profile/address',
        title: 'Address',
        component: CreateAddressComponent,
        canActivate: [authGuard],
      },
      {
        path: 'profile/address/:id/update',
        title: 'updateAddress',
        component: UpdateAddressComponent,
        canActivate: [authGuard],
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
        path: 'manage',
        title: 'จัดการสินค้า',
        component: ManageProductsComponent,
        canActivate: [adminGuard],
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
    path: 'discount',
    children: [
      {
        path: 'list',
        title: 'รายการลดราคา',
        component: DiscountListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'products',
        title: 'ลดราคาสินค้า',
        component: DiscountComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id/update',
        title: 'แก้ไขลดราคาสินค้า',
        component: DiscountUpdateComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'coupon',
    children: [
      {
        path: 'list',
        title: 'คูปอง',
        component: CouponListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'new',
        title: 'สร้างคูปอง',
        component: CouponComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id/update',
        title: 'แก้ไขคูปอง',
        component: CouponUpdateComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'category',
    children: [
      {
        path: 'list',
        title: 'หมวดหมู่สินค้า',
        component: CategoryListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'new',
        title: 'สร้างหมวดหมู่สินค้า',
        component: CategoryCreateComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id/update',
        title: 'แก้ไขหมวดหมู่สินค้า',
        component: CategoryUpdateComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'cart',
    title: 'ตะกร้าสินค้า',
    component: CartSelectProductComponent,
  },
  {
    path: 'order/:id',
    title: 'คำสั่งซื้อสินค้า',
    component: ConfirmOrderComponent,
    canActivate: [authGuard],
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
  {
    path: '',
    title: 'หน้าแรก',
    component: ProductsComponent,
  },
];
