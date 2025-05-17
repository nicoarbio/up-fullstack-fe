import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn().pipe(switchMap(loggedIn => {
    if (!loggedIn) {
      router.navigate(['login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }
    return of(true);
  }));
};
