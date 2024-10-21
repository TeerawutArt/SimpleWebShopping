import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AccountService, authKey } from '../shared/services/account.service';
import { ComponentHelperService } from '../shared/services/component-helper.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Location } from '@angular/common';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const componentHelper = inject(ComponentHelperService);
  const jwtHelper = inject(JwtHelperService);
  const accessToken = localStorage.getItem(authKey.accessToken);
  const location = inject(Location); // Inject Location @angular/common ดูดีๆมี 2 อัน
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = '';
      console.log(router.url);
      if (err.status === 400) {
        if (router.url.startsWith('/account/register')) {
          message = getErrorMessage(err);
        } else if (router.url.startsWith('/account/resetpassword')) {
          message = getErrorMessage(err);
        } else {
          message = err.error ? err.error.errors : err.message;
        }
      } else if (
        (err.status === 401 && accessToken == null) ||
        jwtHelper.isTokenExpired(accessToken)
      ) {
        if (router.url.startsWith('/forbidden')) {
          message = getErrorMessage(err);
        } else if (router.url.startsWith('/home')) {
          message = getErrorMessage(err);
        } else {
          message = err.error ? err.error.errors : err.message;

          componentHelper.setLoginVisible(true);
          accountService.notifyAuthChange(false);
          const currentUrl = location.path(true); // 'true' includes query params
          const hasReturnUrl = currentUrl.includes('returnUrl');
          //ตรงนี้ตรวจว่าขณะหมดสิทธิ์ มี returnUrl อยู่แล้วหรือยัง
          if (!hasReturnUrl) {
            router.navigate(['/forbidden'], {
              queryParams: { returnUrl: router.url },
            });
          } else {
            router.navigate(['/forbidden']);
          }
        }
      } else {
        message = err.error;
      }

      return throwError(() => Error(message));
    })
  );
};

export const getErrorMessage = (err: HttpErrorResponse) => {
  let message = '';
  const errors = Object.values(err.error.errors);
  console.log(errors);
  if (errors != null) {
    message += '<ul>';
    errors.map((e) => {
      message += '<li>' + e + '</li>';
    });
    message += '</ul>';
    return message;
  }
  return message;
};
