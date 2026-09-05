import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

/**
 * Turns the API's ProblemDetails payloads into a plain message on
 * `error.message`, and signs the user out when the token stops working.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/')) {
        auth.signOut();
        void router.navigate(['/account/sign-in']);
      }

      return throwError(() => new Error(describe(error)));
    }),
  );
};

function describe(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server. Check that the API is running.';
  }

  const problem = error.error as ProblemDetails | string | null;

  if (typeof problem === 'string' && problem.trim()) {
    return problem;
  }

  if (problem && typeof problem === 'object') {
    const validation = problem.errors
      ? Object.values(problem.errors).flat().filter(Boolean)
      : [];

    if (validation.length > 0) {
      return validation.join(' ');
    }

    if (problem.detail) {
      return problem.detail;
    }

    if (problem.title) {
      return problem.title;
    }
  }

  return error.status === 401 ? 'Your session has expired. Sign in again.' : 'Something went wrong. Try again.';
}
