import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  PrimeIcons,
} from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

import { HttpErrorResponse } from '@angular/common/http';
import { MenuModule } from 'primeng/menu';

import { AccountService, authKey } from '../../shared/services/account.service';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { LoginUserDto } from '../../shared/dtos/login-user.dto';
import { environment } from '../../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentHelperService } from '../../shared/services/component-helper.service';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MenubarModule,
    ButtonModule,
    MenuModule,
    DialogModule,
    InputTextModule,
    FloatLabelModule,
    AvatarModule,
    PasswordModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  visible: boolean = false;
  items: MenuItem[] | undefined;
  loginForm!: FormGroup;
  isProcessing = false;
  returnUrl = '';
  isUserAuthenticated = false;
  userName = '';
  advancedPermission = false;
  imgUserURL = '';
  rootImgUrl = environment.imageUrl;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private messageService: MessageService,
    private confirm: ConfirmationService,
    private componentHelper: ComponentHelperService,
    private cdr: ChangeDetectorRef
  ) {
    accountService.authChanged.subscribe((res) => {
      this.isUserAuthenticated = res;
      this.navBar();
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.accountService
      .isUserAuthenticated()
      .then((v) => (this.isUserAuthenticated = v));
    this.advancedPermission = this.advancePermission(
      this.accountService.getUserInfo()?.role
    );
    this.imgUserURL = this.accountService.getUserInfo()?.imgUrl;
    this.navBar();
    this.loginForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.userName = this.accountService.getUserInfo()?.userName;
    this.componentHelper.loginVisibleModal.subscribe((res) => {
      this.visible = res;
    });
  }
  navBar() {
    this.items = [];
    this.items.push({ label: 'Home', routerLink: '/' });
    //
    if (this.isUserAuthenticated) {
      if (this.advancedPermission) {
        this.items.push({
          label: 'Product',
          items: [
            {
              label: 'All',
              icon: PrimeIcons.LIST,
              routerLink: '/product/list',
            },
            {
              label: 'New',
              icon: PrimeIcons.PLUS,
              routerLink: '/product/new',
            },
          ],
        });
      }else{
      this.items.push({ label: 'Product', routerLink: 'product/list' });
      this.items.push({ label: 'News', routerLink: 'news' });
      }

    } else {
      this.items.push({ label: 'Product', routerLink: 'product/list' });
      this.items.push({ label: 'News', routerLink: 'news' });
    }
  }
  showLogin() {
    this.returnUrl = this.router.url; //เก็บ url หน้าที่ทำการกดปุ่ม login
    this.componentHelper.setLoginVisible(true);
  }

  advancePermission(role: string) {
    if (role == 'Sale' || role == 'Admin') {
      return true;
    }
    return false;
  }

  validateControl(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.invalid && control?.touched;
  }
  hasError(controlName: string, errorName: string) {
    const control = this.loginForm.get(controlName);
    return control?.hasError(errorName);
  }
  loginUser() {
    const req: LoginUserDto = {
      userName: this.loginForm.get('userName')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.loginForm.disable();
    this.isProcessing = true;
    this.messageService.clear();

    this.accountService.login(req).subscribe({
      next: (res) => {
        localStorage.setItem(authKey.accessToken, res.accessToken!);
        localStorage.setItem(authKey.refreshToken, res.refreshToken!);
        const userInfo = this.accountService.getUserInfo();
        this.userName = userInfo?.userName;
        this.advancedPermission = this.advancePermission(userInfo?.role);
        this.accountService.notifyAuthChange(true);
        this.navBar();
        this.imgUserURL = userInfo?.imgUrl;
        this.returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;

        this.messageService.add({
          severity: 'success',
          summary: 'เข้าสู่ระบบสำเร็จ',
          detail: 'ยินดีต้อนรับ' + ' ' + userInfo?.fullName,
        });
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
          this.loginForm.enable();
          this.loginForm.reset();
          this.isProcessing = false;
          this.componentHelper.setLoginVisible(false);
        }, 333);
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'เข้าสู่ระบบล้มเหลว',
          detail: err.message,
          sticky: true,
        });
        this.isProcessing = false;
        this.loginForm.enable();
      },
    });
  }
  logout() {
    this.confirm.confirm({
      header: 'Log Out',
      message: 'Are you sure you want to log out?',
      accept: () => {
        this.accountService.logout().subscribe({
          next: (_) => {},
          error: (err: HttpErrorResponse) => {
            if (!environment.production) {
              console.log(err);
            }
          },
        });
        this.logoutUser();
        this.advancedPermission = false;
        this.navBar();
      },
    });
  }
  private logoutUser() {
    localStorage.removeItem(authKey.accessToken);
    localStorage.removeItem(authKey.refreshToken);

    this.accountService.notifyAuthChange(false);

    this.router.navigate(['/']);
  }
}
