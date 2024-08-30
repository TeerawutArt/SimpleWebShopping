import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AccountService, authKey } from '../shared/services/account.service';
import { ComponentHelperService } from '../shared/services/component-helper.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const componentHelper = inject(ComponentHelperService);
  const jwtHelper = inject(JwtHelperService);
  const accessToken = localStorage.getItem(authKey.accessToken);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.log(err);
      let message = '';

      if (err.status === 400) {
        if (router.url.startsWith('/account/register')) {
          message = getErrorMessage(err);
          console.log(message);
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
          router.navigate(['/forbidden'], {
            queryParams: { returnUrl: router.url },
          });
        }
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
