import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};
