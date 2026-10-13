import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Route guard that strictly restricts access to users with the 'admin' role.
 * If the user is logged in as a regular customer/viewer, they are redirected to /access-denied.
 * If the user is not logged in at all, they are redirected to /account to sign in.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    // User is logged in, but role is 'customer' or 'viewer'
    router.navigate(['/access-denied']);
    return false;
  }

  // Not logged in at all
  router.navigate(['/account'], {
    queryParams: {
      returnUrl: '/admin',
      error: 'admin_required'
    }
  });
  return false;
};
