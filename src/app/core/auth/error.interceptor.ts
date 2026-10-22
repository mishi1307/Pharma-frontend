import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(catchError((error: unknown) => {
  if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/login')) inject(AuthService).cerrarSesion();
  return throwError(() => error);
}));
