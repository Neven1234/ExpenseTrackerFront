import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isSignedIn()
    ? true
    : router.createUrlTree(['/account/sign-in'], { queryParams: { returnUrl: state.url } });
};

/** Keeps a signed-in user off the sign-in / create-account screens. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isSignedIn() ? router.createUrlTree(['/overview']) : true;
};
