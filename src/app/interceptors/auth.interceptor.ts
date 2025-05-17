import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return from(auth.getValidAccessToken())
    .pipe(switchMap((accessToken) => {
      const setHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (accessToken) {
        setHeaders['Authorization'] = `Bearer ${ accessToken }`;
      }

      const cloned = req.clone({ setHeaders });
      return next(cloned);
    })
  );
};
