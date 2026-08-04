import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.initialize().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      return user.role === 'admin' ? true : router.createUrlTree(['/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
