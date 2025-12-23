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

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { debounceTime, pipe, tap } from "rxjs";
import { ControlEvent, FormGroup } from "@angular/forms";
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { SocialProvider } from "@tenzu/repository/auth";

export const AuthConfigStore = signalStore(
  { providedIn: "root" },
  withState<{ formHasError: boolean }>({
    formHasError: false,
  }),
  withEntities<SocialProvider>(),
  withMethods((store) => ({
    resetFormHasError(): void {
      patchState(store, { formHasError: false });
    },
    updateFormHasError: rxMethod<ControlEvent<FormGroup>>(
      pipe(
        debounceTime(200),
        tap((event) => {
          patchState(store, { formHasError: event.source.errors != null && event.source.touched });
        }),
      ),
    ),
    setProviders(providers: SocialProvider[]): void {
      patchState(store, setAllEntities(providers));
    },
  })),
);
