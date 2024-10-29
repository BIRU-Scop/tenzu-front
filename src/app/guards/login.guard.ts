import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { AuthService } from "@tenzu/data/auth";

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  return authService.isLoginOk().pipe(
    tap((value) => {
      if (!value) {
        authService.logout();
      }
    }),
    catchError(() => {
      authService.logout();
      return of(false);
    }),
  );
};
