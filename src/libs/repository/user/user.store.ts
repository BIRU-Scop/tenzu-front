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

import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { effect, inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { lastValueFrom, pipe, switchMap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { UserApiService } from "./user-api.service";
import { UpdateUserPayload, User } from "./user.model";
import { TranslocoService } from "@jsverse/transloco";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { ResetService } from "@tenzu/repository/base/reset.service";
import { debug } from "@tenzu/utils/functions/logging";

export const UserStore = signalStore(
  { providedIn: "root" },
  withState({
    myUser: {} as User,
  }),
  withMethods(
    (
      store,
      userApiService = inject(UserApiService),
      translocoService = inject(TranslocoService),
      sessionLifecycleService = inject(SessionLifecycleService),
    ) => {
      const getMe = rxMethod<void>(
        pipe(
          switchMap(() =>
            userApiService.getMyUser().pipe(
              tapResponse({
                next: (myUser) => {
                  patchMe(myUser);
                  debug("user", "get user end");
                },
                error: console.error,
              }),
            ),
          ),
        ),
      );
      const patchMe = async (myUser: User) => {
        if (myUser.lang) {
          translocoService.setActiveLang(myUser.lang);
        }
        patchState(store, { myUser });
      };
      const patchMeRequest = async (value: UpdateUserPayload) => {
        const myUser = await lastValueFrom(userApiService.patchMyUser(value));
        await patchMe(myUser);
      };
      const changePassword = async (password: UpdateUserPayload["password"]) => {
        await lastValueFrom(userApiService.patchMyUser({ password }));
        sessionLifecycleService.endSession({ reason: "passwordChanged" });
      };
      const deleteUser = async () => {
        await lastValueFrom(userApiService.deleteUser());
        sessionLifecycleService.endSession({ reason: "accountDeleted" });
      };
      const requestResetPassword = (email: string) => {
        return lastValueFrom(userApiService.requestResetPassword(email));
      };
      const resetMe = () => {
        patchState(store, { myUser: {} as User });
      };
      return { getMe, patchMe, patchMeRequest, changePassword, deleteUser, requestResetPassword, resetMe };
    },
  ),
  withHooks({
    onInit(store) {
      inject(ResetService).register({ resetAll: () => store.resetMe() });
      const sessionLifecycleService = inject(SessionLifecycleService);
      effect(() => {
        if (sessionLifecycleService.step() === "loggedIn") {
          store.getMe();
        }
      });
    },
  }),
);

export type UserStore = InstanceType<typeof UserStore>;
