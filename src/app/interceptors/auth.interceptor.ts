import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = localStorage.getItem('accessToken');

  const setHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (accessToken) {
    setHeaders['Authorization'] = `Bearer ${ accessToken }`;
  }

  const cloned = req.clone({ setHeaders });

  return next(cloned);

};
