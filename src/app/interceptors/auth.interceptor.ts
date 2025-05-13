import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const setHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (token) {
    setHeaders['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({ setHeaders });

  return next(cloned);

};
