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

import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, EMPTY, from, switchMap, throwError } from "rxjs";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { retryWhenErrors } from "@tenzu/repository/base/utils";
import { getLocError } from "@tenzu/utils/functions/errors";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";

export function httpInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const tokenRepositoryService = inject(TokenRepositoryService);
  const notificationService = inject(NotificationService);
  const configAppService = inject(ConfigAppService);
  request = request.clone({
    setHeaders: {
      "correlation-id": configAppService.correlationId,
    },
  });
  const isAuthEndpoint = request.url.startsWith(`${configAppService.apiUrl()}/auth/`);

  return next(request).pipe(
    retryWhenErrors(),
    catchError((error) => {
      if (error instanceof HttpErrorResponse && !isAuthEndpoint && error.status === HttpStatusCode.Unauthorized) {
        if (tokenRepositoryService.hasUsableRefresh()) {
          return from(tokenRepositoryService.rotate()).pipe(
            switchMap(() => next(request)),
            catchError(() => throwError(() => error)),
          );
        }
        return EMPTY;
      } else if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          // @ts-expect-error FALLS THROUGH
          case 422:
            // 422 on user creation can happen if the user chooses a password that doesn't validate backend vulnerability detection
            if (request.url.endsWith("users") && getLocError(error, "password")) {
              break;
            }
            // 422 on file upload can happen if the file is invalid
            if (request.url.endsWith("importations") && getLocError(error, "source")) {
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
