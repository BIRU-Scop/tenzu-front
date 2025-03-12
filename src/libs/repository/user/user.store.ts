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

import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { lastValueFrom, of, pipe, switchMap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { UserService } from "./user.service";
import { User, UserEdition } from "./user.model";
import { TranslocoService } from "@jsverse/transloco";
import { AuthService } from "../auth";
import { WsService } from "@tenzu/utils/services/ws";
import { debug } from "../../utils/functions/logging";

export const UserStore = signalStore(
  { providedIn: "root" },
  withState({
    myUser: {} as User,
  }),
  withMethods(
    (
      store,
      userService = inject(UserService),
      translocoService = inject(TranslocoService),
      authService = inject(AuthService),
      wsService = inject(WsService),
    ) => ({
      getMe: rxMethod<void>(
        pipe(
          switchMap(() => {
            if (localStorage.getItem("token")) {
              return userService.getMyUser().pipe(
                tapResponse({
                  next: (myUser) => {
                    patchState(store, { myUser });
                    if (myUser.lang) {
                      translocoService.setActiveLang(myUser.lang);
                    }
                    localStorage.setItem("user", JSON.stringify(myUser));
                    wsService.command({ command: "signin", token: localStorage.getItem("token") || "" });
                    debug("user", "get user end");
                  },
                  error: console.error,
                }),
              );
            } else {
              return of(null);
            }
          }),
        ),
      ),
      async patchMe(value: Partial<UserEdition>) {
        const myUser = await lastValueFrom(userService.patchMyUser(value));
        if (myUser.lang) {
          translocoService.setActiveLang(myUser.lang);
        }
        patchState(store, { myUser });
      },
      async changePassword(password: UserEdition["password"]) {
        await lastValueFrom(userService.patchMyUser({ password }));
        return authService.logout();
      },
      async deleteUser() {
        userService.deleteUser().subscribe();
        return authService.logout();
      },
      requestResetPassword(email: string) {
        return lastValueFrom(userService.requestResetPassword(email));
      },
      resetMe() {
        patchState(store, { myUser: {} as User });
      },
    }),
  ),
  withHooks({
    onInit({ getMe }) {
      debug("user", "get user start");
      getMe();
    },
  }),
);

export type UserStore = InstanceType<typeof UserStore>;
