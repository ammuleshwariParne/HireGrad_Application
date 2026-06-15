import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowed: UserRole): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.role();

    if (role === allowed) return true;
    if (role === 'STUDENT') return router.createUrlTree(['/student']);
    if (role === 'ADMIN') return router.createUrlTree(['/admin']);
    return router.createUrlTree(['/login']);
  };
};