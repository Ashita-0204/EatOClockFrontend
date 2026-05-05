import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route, _state) => {
  const authService = inject(AuthService);
  const allowedRoles: Role[] = route.data['roles'];
  const userRole = authService.getRole();

  if (!authService.isLoggedIn()) {
    return false;
  }

  if (userRole !== null && allowedRoles.includes(userRole)) {
    return true;
  }

  authService.redirectByRole();
  return false;
};