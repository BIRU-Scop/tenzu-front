/*
 * Copyright (C) 2024 BIRU
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
import { AuthService } from "../auth";
import { catchError, EMPTY, switchMap, throwError } from "rxjs";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ConfigServiceService } from "../../utils/services/config-service/config-service.service";

export function refreshTokenInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const tokens = authService.getToken();
  const notificationService = inject(NotificationService);
  const configService = inject(ConfigServiceService);
  request = request.clone({
    setHeaders: {
      "correlation-id": configService.correlationId,
    },
  });

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
