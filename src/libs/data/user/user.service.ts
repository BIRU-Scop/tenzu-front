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

import { inject, Injectable } from "@angular/core";
import { User, UserCreation, UserDeleteInfo, UserEdition, VerificationData } from "./user.model";
import { HttpClient } from "@angular/common/http";
import { Tokens } from "@tenzu/data/auth";
import { ConfigAppService } from "../../../app/config-app/config-app.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  endpoint = `${this.configAppService.apiUrl()}`;
  myUserUrl = `${this.endpoint}my/user`;
  usersUrl = `${this.endpoint}users`;

  getMyUser() {
    return this.http.get<User>(`${this.myUserUrl}`);
  }

  patchMyUser(item: Partial<UserEdition>) {
    return this.http.put<User>(`${this.myUserUrl}`, item);
  }

  create(item: UserCreation) {
    return this.http.post<User>(`${this.usersUrl}`, item);
  }

  requestResetPassword(email: string) {
    return this.http.post<{ email: string }>(`${this.usersUrl}/reset-password`, {
      email,
    });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<Tokens>(`${this.usersUrl}/reset-password/${token}`, { password });
  }

  verifyResetTokenPassword(token: string) {
    return this.http.get<boolean>(`${this.usersUrl}/reset-password/${token}/verify`);
  }

  verifyUsers(token: string) {
    return this.http.post<VerificationData>(`${this.usersUrl}/verify`, { token: token });
  }

  getDeleteInfo() {
    return this.http.get<UserDeleteInfo>(`${this.myUserUrl}/delete-info`);
  }

  deleteUser() {
    return this.http.delete<null>(`${this.myUserUrl}`);
  }
}
