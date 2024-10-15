import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ConfirmationService,
  LazyLoadMeta,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DialogModule } from 'primeng/dialog';
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { SpeedDialModule } from 'primeng/speeddial';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NotifyNewsComponent } from '../../notify-news/notify-news.component';
import { CutTextPipe } from '../../../shared/pipe/cut-text.pipe';
import { ProductListDto } from '../../../shared/dtos/product-list.dto';
import { environment } from '../../../../environments/environment.development';
import { CustomValidatorService } from '../../../shared/services/custom-validator.service';
import { AccountService } from '../../../shared/services/account.service';
import { ProductService } from '../../../shared/services/product.service';
import { PagingDto } from '../../../shared/dtos/paging.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductUpdateAvailableDto } from '../../../shared/dtos/product-update-available.dto';
import {
  DataView,
  DataViewLayoutOptions,
  DataViewModule,
} from 'primeng/dataview';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { CartService } from '../../../shared/services/cart.service';
@Component({
  selector: 'app-products',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    CommonModule, //เพื่อใช้ datePipe ของ angular ขี้เกียจจัด format เอง
    CardModule,
    PanelModule,
    AvatarModule,
    ButtonModule,
    MenuModule,
    CheckboxModule,
    NotifyNewsComponent,
    CalendarModule,
    InputGroupModule,
    InputGroupAddonModule,
    SplitButtonModule,
    PaginatorModule,
    ScrollPanelModule,
    InputSwitchModule,
    DialogModule,
    FileUploadModule,
    SpeedDialModule,
    CutTextPipe,
    ProgressSpinnerModule,
    DataViewModule,
    RatingModule,
    TagModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  @ViewChild(FileUpload) fileUploadComponent!: FileUpload;
  @ViewChild('dataView') dataView!: DataView;
  visible: boolean = false;
  loading: boolean = false;

  isProcessing = false;
  updateProductForm!: FormGroup;
  uploadImage: File | string = '';
  menuItems!: MenuItem[];
  products: ProductListDto[] = [];
  curProduct!: ProductListDto;
  curDate!: Date;
  activePage!: number;
  pageIndex = 1;
  pageSize = 12;
  hasPermission = false;
  keyword: string = '';
  manageProductMode = false;
  HideDisableProduct = false;
  totalRecords = 0;
  rootImgUrl = environment.imageUrl;
  dateNow!: Date;
  minDate!: Date;
  isTotalAmountInvalid = false;
  isUserAuthenticated = false;
  returnUrl = '';
  dataViewState!: DataView;

  sortField: string = '';
  // prettier-ignore
  constructor(
    private customValidator: CustomValidatorService,
    private accountService: AccountService,
    private messageService: MessageService,
    private productService: ProductService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService:CartService
  ) {
  }
  ngOnInit(): void {
    //จะทำงานเมื่อมีการ login  (ค่าที่ซับฯไว้เปลี่ยนค่า)
    this.accountService.authChanged.subscribe((res) => {
      this.isUserAuthenticated = res;
      if (
        this.accountService.isUserInRole('Sale') ||
        this.accountService.isUserInRole('Admin')
      ) {
        this.hasPermission = true;
      }
    });
    this.dateNow = new Date();
    this.minDate = new Date();
    this.updateProductForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      TotalAmount: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });
    // prettier-ignore
    this.updateProductForm.get('endDate')?.addValidators(this.customValidator.endDateInvalid(this.updateProductForm.get('startDate')!));
    // prettier-ignore
    this.updateProductForm.get('startDate')?.addValidators(this.customValidator.startDateInvalid(this.updateProductForm.get('endDate')!));
    this.curDate = new Date();
    this.curDate.setFullYear(this.curDate.getFullYear() + 543); //แปลงเป็น พ.ศ ด้วย
    this.activePage = 0;

    this.menuItems = this.settingMenu();
  }
  settingMenu(): MenuItem[] {
    let labelText: string = '';
    if (this.curProduct) {
      if (this.curProduct.isAvailable) {
        labelText = 'ระงับการขาย';
      } else {
        labelText = 'เปิดการขาย';
      }
    }

    const settingItem: MenuItem[] = [
      {
        label: 'แก้ไข',
        icon: 'pi pi-pen-to-square',
        command: () => this.updateProduct(),
      },
      {
        label: labelText,
        icon: 'pi pi-stop-circle',
        command: () =>
          this.changeProductAvailable(
            this.curProduct.productId,
            {
              isAvailable: !this.curProduct.isAvailable,
            },
            this.dataViewState
          ),
      },
      {
        label: 'ลดราคา',
        icon: 'pi pi-dollar',
        command: () => this.discountProduct([this.curProduct]),
      },
      {
        label: 'ลบ',
        icon: 'pi pi-trash',
        command: () => this.deleteProduct(this.curProduct),
      },
    ];
    return settingItem;
  }

  updateProduct() {
    this.returnUrl = this.router.url;
    this.router.navigate(
      ['/product/' + this.curProduct.productId + '/update'],
      {
        state: { saveProduct: this.curProduct },
        queryParams: { returnUrl: this.returnUrl },
      }
    );
  }
  onDropDownClickSetup(product: ProductListDto, dv: DataView) {
    this.curProduct = product;
    this.dataViewState = dv;
    console.log(this.dataViewState);
  }

  valueChange(dv: DataView) {
    this.getAllProduct(dv);
  }
  onFilter(dv: DataView, event: any) {
    if (
      event.code === 'Enter' ||
      (event.code === 'NumpadEnter' && this.keyword)
    )
      this.getAllProduct(dv);
  }
  getAllProduct(e: LazyLoadMeta) {
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
          console.log(res);
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
            e.inventoryStatus = e.productTotalAmount>0?'INSTOCK':'OUTOFSTOCK'
          });
          console.log(this.products);
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
  onPageChange(product: PaginatorState) {
    this.activePage = product.first!;
    this.pageIndex = Math.floor(product.first! / product.rows!) + 1;
    this.pageSize = product.rows!;
  }
  buyProduct(product: ProductListDto) {
    var req = { productId: product.productId, quantity: 1 };
    this.cartService.AddProductCart(req).subscribe({
      next: (_) => {
        this.cartService.setUpdateCart(true);
        this.router.navigate(['cart']);
      },
      error: () => {
        this.messageService.add({
          summary: 'Something Error',
          severity: 'danger',
          detail: 'something error',
        });
      },
    });
  }
  addProductToCart(product: ProductListDto) {
    var req = { productId: product.productId, quantity: 1 };
    this.messageService.clear();
    this.cartService.AddProductCart(req).subscribe({
      next: (_) => {
        this.messageService.add({
          severity: 'success',
          summary: 'เพิ่มสินค้าเรียบร้อยแล้ว',
          detail: `สินค้า ${product.productName} ถูกเพิ่มในตะกร้า`,
          life: 1000,
        });
        this.cartService.setUpdateCart(true);
      },
      error: () => {
        this.messageService.add({
          summary: 'Something Error',
          severity: 'danger',
          detail: 'something error',
        });
      },
    });
  }
  discountProduct(selectedProduct: ProductListDto[]) {
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
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
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

  changeProductAvailable(
    id: string,
    req: ProductUpdateAvailableDto,
    dv: DataView
  ) {
    let messageConfirm = '';
    !req.isAvailable
      ? (messageConfirm = 'คุณกำลังจะปิดการขายสินค้า')
      : (messageConfirm = 'คุณกำลังเปิดขายสินค้า');
    this.confirmationService.confirm({
      message: `${messageConfirm} "${this.curProduct.productName}"`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.changeProductAvailable(id, req).subscribe({
          next: (_) => {
            if (!req.isAvailable) {
              this.messageService.add({
                summary: 'ระงับสินค้าเรียบร้อยแล้ว',
                severity: 'success',
                detail: `สินค้า "${this.curProduct.productName} ถูกระงับแล้ว"`,
              });
            } else {
              this.messageService.add({
                summary: 'เปิดขายสินค้าเรียบร้อยแล้ว',
                severity: 'success',
                detail: `สินค้า "${this.curProduct.productName} เปิดขายอีกครั้ง"`,
              });
            }
            this.getAllProduct(dv);
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
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
