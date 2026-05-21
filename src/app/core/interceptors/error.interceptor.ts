import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../store/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          // Token expired or invalid — clear auth state and redirect to login
          authStore.clearToken();
          router.navigate(['/auth']);
        }
        // TODO(angular-logic-implementer): add toast notifications for 403, 500, etc.
      }
      return throwError(() => error);
    })
  );
};
