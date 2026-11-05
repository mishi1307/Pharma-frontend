import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from './auth.models';
import { AuthService } from './auth.service';
export const permisoGuard: CanActivateFn = route => {
  const auth = inject(AuthService); const router = inject(Router);
  const permiso = route.data['permiso'] as Permiso | undefined;
  return permiso && !auth.tienePermiso(permiso) ? router.createUrlTree(['/acceso-denegado']) : true;
};
