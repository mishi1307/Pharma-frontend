import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.autenticado() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.autenticado() ? router.createUrlTree(['/inicio']) : true;
};
