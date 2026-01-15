/*
 * Copyright (C) 2024-2026 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@tenzu/repository/auth";
import { catchError, EMPTY, switchMap, throwError } from "rxjs";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { retryWhenErrors } from "@tenzu/repository/base/utils";

export function httpInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const tokens = authService.getToken();
  const jwtHelperService = inject(JwtHelperService);
  const notificationService = inject(NotificationService);
  const configAppService = inject(ConfigAppService);
  request = request.clone({
    setHeaders: {
      "correlation-id": configAppService.correlationId,
    },
  });

  return next(request).pipe(
    retryWhenErrors(),
    catchError((error) => {
      if (error instanceof HttpErrorResponse && !request.url.includes("auth") && error.status === 401) {
        if (tokens.refresh && !jwtHelperService.isTokenExpired(tokens.refresh)) {
          return authService.refresh(tokens).pipe(
            switchMap(() => {
              return next(request);
            }),
          );
        } else {
          authService.autoLogout();
          return EMPTY;
        }
      } else if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          // @ts-expect-error FALLS THROUGH
          case 422:
            // 422 on user creation can happen if the user chooses a password that doesn't validate backend vulnerability detection
            if (request.url.endsWith("users") && authService.isPasswordError(error)) {
              break;
            }
          // eslint-disable-next-line no-fallthrough
          case 500:
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
