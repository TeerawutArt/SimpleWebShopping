import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';

export const studentGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  const res = accountService.isUserInRole('Seller');

  if (!res) {
    router.navigate(['/forbidden'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return res;
};
