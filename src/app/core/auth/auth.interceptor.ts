import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(AuthService).sesion();
  if (!sesion?.token || !req.url.startsWith(environment.apiUrl)) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `${sesion.tipo || 'Bearer'} ${sesion.token}` } }));
};

