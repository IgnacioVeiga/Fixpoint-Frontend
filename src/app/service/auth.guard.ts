import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthSessionService } from './auth-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const sessionStore = inject(AuthSessionService);
  const router = inject(Router);

  if (sessionStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: state.url ? { redirect: state.url } : undefined
  });
};

export const guestGuard: CanActivateFn = () => {
  const sessionStore = inject(AuthSessionService);
  const router = inject(Router);

  if (sessionStore.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
