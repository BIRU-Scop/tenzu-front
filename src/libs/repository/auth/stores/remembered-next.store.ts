/*
 * Copyright (C) 2025-2026 BIRU
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
import { withSessionStorage, withStorageSync } from "@angular-architects/ngrx-toolkit";
import { usableNext } from "@tenzu/utils/functions/urls";

import { SESSION_KEY_PREFIX } from "./session-storage";

export const NEXT_KEY = `${SESSION_KEY_PREFIX}next`;

export type RememberedNext = { next: string; username: string | null };

export const RememberedNextStore = signalStore(
  { providedIn: "root" },
  withState<{ remembered: RememberedNext | null }>({ remembered: null }),
  withStorageSync(
    {
      key: NEXT_KEY,
      autoSync: false,
      select: (state) => state.remembered,
      parse: (text) => ({ remembered: JSON.parse(text) as RememberedNext }),
    },
    withSessionStorage(),
  ),
  withMethods((store) => ({
    remember(next: string, username: string | null): void {
      patchState(store, { remembered: { next, username } });
      store.writeToStorage();
    },

    take(username: string): string | null {
      const remembered = store.remembered();
      patchState(store, { remembered: null });
      store.clearStorage();
      if (remembered === null || (remembered.username !== null && remembered.username !== username)) {
        return null;
      }
      return usableNext(remembered.next);
    },
  })),
  withHooks((store) => ({ onInit: () => store.readFromStorage() })),
);

export type RememberedNextStore = InstanceType<typeof RememberedNextStore>;
