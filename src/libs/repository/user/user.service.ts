/*
 * Copyright (C) 2024-2025 BIRU
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
import { User, CreateUserPayload, UserDeleteInfo, UpdateUserPayload, VerificationInfo } from "./user.model";
import { HttpClient } from "@angular/common/http";
import { Tokens } from "../auth";
import { ConfigAppService } from "../../../app/config-app/config-app.service";
import { Observable } from "rxjs";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UserService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  endpoint = `${this.configAppService.apiUrl()}`;
  myUserUrl = `${this.endpoint}/users/me`;
  usersUrl = `${this.endpoint}/users`;

  getMyUser(): Observable<User> {
    return this.http.get<BaseDataModel<User>>(`${this.myUserUrl}`).pipe(map((dataObject) => dataObject.data));
  }

  patchMyUser(item: UpdateUserPayload): Observable<User> {
    return this.http.put<BaseDataModel<User>>(`${this.myUserUrl}`, item).pipe(map((dataObject) => dataObject.data));
  }

  create(item: CreateUserPayload): Observable<User> {
    return this.http.post<BaseDataModel<User>>(`${this.usersUrl}`, item).pipe(map((dataObject) => dataObject.data));
  }

  requestResetPassword(email: string): Observable<{ email: string }> {
    return this.http.post<{ email: string }>(`${this.usersUrl}/reset-password`, {
      email,
    });
  }

  resetPassword(token: string, password: string): Observable<Tokens> {
    return this.http.post<Tokens>(`${this.usersUrl}/reset-password/${token}`, { password });
  }

  verifyResetTokenPassword(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.usersUrl}/reset-password/${token}/verify`);
  }

  verifyUsers(token: string): Observable<VerificationInfo> {
    return this.http.post<VerificationInfo>(`${this.usersUrl}/verify`, { token: token });
  }

  getDeleteInfo(): Observable<UserDeleteInfo> {
    return this.http.get<UserDeleteInfo>(`${this.myUserUrl}/delete-info`);
  }

  deleteUser(): Observable<void> {
    return this.http.delete<void>(`${this.myUserUrl}`);
  }
}
