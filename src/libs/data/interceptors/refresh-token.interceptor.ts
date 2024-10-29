import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../auth";
import { catchError, EMPTY, switchMap, throwError } from "rxjs";
import { NotificationService } from "@tenzu/utils/services";

export function refreshTokenInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const tokens = authService.getToken();
  const notificationService = inject(NotificationService);
  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && !request.url.includes("login") && error.status === 401) {
        if (tokens.refresh) {
          return authService.refresh(tokens).pipe(
            switchMap(() => {
              return next(request);
            }),
            catchError((error) => {
              if (error.status === 401 || error.status === 403) {
                authService.logout();
                notificationService.error({ title: "notification.login.logout" });
                return EMPTY;
              }
              return throwError(() => error);
            }),
          );
        }
      } else if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 500:
          case 422:
            notificationService.error(
              {
                title: "notification.server_errors.http500.title",
                detail: "notification.server_errors.http500.message",
                translocoDetail: true,
              },
              { duration: 5000 },
            );
            break;
          case 403:
            notificationService.error(
              {
                title: "notification.server_errors.http403.title",
                detail: "notification.server_errors.http403.message",
                translocoDetail: true,
              },
              { duration: 5000 },
            );
            break;
        }
      }
      return throwError(() => error);
    }),
  );
}
