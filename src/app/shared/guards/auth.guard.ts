import { ActivatedRoute, CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';
import { ComponentHelperService } from '../services/component-helper.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const componentHelper = inject(ComponentHelperService);

  const res = await accountService.isUserAuthenticated();

  if (!res) {
    componentHelper.setLoginVisible(true);
    accountService.notifyAuthChange(res);
    router.navigate(['/forbidden'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return res;
};
