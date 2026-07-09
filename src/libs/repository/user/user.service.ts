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

import { inject, Injectable } from "@angular/core";
import { z } from "zod/v4";
import {
  CreateUserPayload,
  SendVerifyUserValidator,
  UpdateUserPayload,
  User,
  userSchema,
  UserDeleteInfo,
  userDeleteInfoSchema,
  VerificationInfo,
  verificationInfoSchema,
} from "./user.model";
import { HttpClient } from "@angular/common/http";
import { Tokens, tokensSchema } from "../auth/auth.model";
import { Observable, tap } from "rxjs";
import { ConfigAppService } from "../config-app/config-app.service";
import { BaseDataModel } from "../base/misc.model";
import { parseWithDebug } from "../base/schema-utils";
import { map } from "rxjs/operators";
import { NotificationService } from "@tenzu/utils/services/notification";

@Injectable({
  providedIn: "root",
})
export class UserService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  notificationService = inject(NotificationService);
  endpoint = `${this.configAppService.apiUrl()}`;
  myUserUrl = `${this.endpoint}/users/me`;
  usersUrl = `${this.endpoint}/users`;

  getMyUser(): Observable<User> {
    return this.http
      .get<BaseDataModel<unknown>>(`${this.myUserUrl}`)
      .pipe(map((dataObject) => parseWithDebug(userSchema, dataObject.data)));
  }

  patchMyUser(item: UpdateUserPayload): Observable<User> {
    return this.http
      .put<BaseDataModel<unknown>>(`${this.myUserUrl}`, item)
      .pipe(map((dataObject) => parseWithDebug(userSchema, dataObject.data)));
  }

  create(item: CreateUserPayload): Observable<User> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.usersUrl}`, item)
      .pipe(map((dataObject) => parseWithDebug(userSchema, dataObject.data)));
  }

  requestResetPassword(email: string): Observable<{ email: string }> {
    return this.http
      .post<unknown>(`${this.usersUrl}/reset-password`, {
        email,
      })
      .pipe(map((data) => parseWithDebug(z.object({ email: z.string() }), data)));
  }

  resetPassword(token: string, password: string): Observable<Tokens> {
    return this.http
      .post<unknown>(`${this.usersUrl}/reset-password/${token}`, { password })
      .pipe(map((data) => parseWithDebug(tokensSchema, data)));
  }

  verifyResetTokenPassword(token: string): Observable<boolean> {
    return this.http
      .get<unknown>(`${this.usersUrl}/reset-password/${token}/verify`)
      .pipe(map((data) => parseWithDebug(z.boolean(), data)));
  }

  verifyUser(token: string): Observable<VerificationInfo> {
    return this.http
      .post<unknown>(`${this.usersUrl}/verify`, { token: token })
      .pipe(map((data) => parseWithDebug(verificationInfoSchema, data)));
  }

  resentVerification(item: SendVerifyUserValidator): Observable<null> {
    return this.http.post<null>(`${this.usersUrl}/resend-verification`, item).pipe(
      tap(() => {
        this.notificationService.open({
          type: "success",
          title: "auth.signup.verify.resend_email_label",
          translocoTitle: true,
          detail: "auth.signup.verify.resend_email_message",
          translocoDetail: true,
        });
      }),
    );
  }

  getDeleteInfo(): Observable<UserDeleteInfo> {
    return this.http
      .get<unknown>(`${this.myUserUrl}/delete-info`)
      .pipe(map((data) => parseWithDebug(userDeleteInfoSchema, data)));
  }

  deleteUser(): Observable<void> {
    return this.http.delete<void>(`${this.myUserUrl}`);
  }
}
