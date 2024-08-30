import { ActivatedRoute, CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';
import { ComponentHelperService } from '../services/component-helper.service';

export const isLoginGuard: CanActivateFn = async (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const componentHelper = inject(ComponentHelperService);

  const login = await accountService.isUserAuthenticated();

  if (login) {
    router.navigate(['/'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return !login;
};
