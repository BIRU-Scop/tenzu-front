import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { lastValueFrom, of, pipe, switchMap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { UserService } from "./user.service";
import { User, UserEdition } from "./user.model";
import { TranslocoService } from "@jsverse/transloco";
import { AuthService } from "@tenzu/data/auth";

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
      getMe();
    },
  }),
);

export type UserStore = InstanceType<typeof UserStore>;
