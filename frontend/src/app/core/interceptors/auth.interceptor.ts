import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the JWT to API calls, and — when a protected call comes back 401/403
 * (missing or expired token) — clears the stale session and sends the user to
 * login instead of leaving them stuck on a "403 Forbidden". Auth endpoints are
 * exempt so a bad login shows its own inline error.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.user()?.token;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthCall = req.url.includes('/api/auth/');
      if (!isAuthCall && (err.status === 401 || err.status === 403)) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
