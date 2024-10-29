import { inject, Injectable } from "@angular/core";
import { User, UserCreation, UserDeleteInfo, UserEdition, VerificationData } from "./user.model";

import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Tokens } from "@tenzu/data/auth";

@Injectable({
  providedIn: "root",
})
export class UserService {
  http = inject(HttpClient);
  endpoint = `${environment.api.scheme}://${environment.api.baseDomain}/${environment.api.suffixDomain}/${environment.api.prefix}`;
  myUserUrl = `${this.endpoint}/my/user`;
  usersUrl = `${this.endpoint}/users`;

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
