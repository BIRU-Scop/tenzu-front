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

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type NavListItem = {
  iconName: string;
  label: string;
  href: string;
  testId: string;
  componentConfig?: {
    componentRef: string;
    data?: any;
  };
};
export type SideNavAvatar = {
  type: string;
  name: string;
  color: number;
};

const initialState = {
  primaryNavItems: [],
  secondaryNavItems: [],
  avatar: undefined,
  resized: false,
};

export const SideNavStore = signalStore(
  { providedIn: "root" },
  withState<{
    primaryNavItems: NavListItem[];
    secondaryNavItems: NavListItem[];
    avatar: SideNavAvatar | undefined;
    resized: boolean;
  }>(initialState),
  withMethods((store) => ({
    setPrimaryNavItems(primaryNavItems: NavListItem[]) {
      patchState(store, { primaryNavItems });
    },
    setSecondaryNavItems(secondaryNavItems: NavListItem[]) {
      patchState(store, { secondaryNavItems });
    },
    setAvatar(avatar?: SideNavAvatar) {
      patchState(store, { avatar });
    },
    setResized(resized: boolean) {
      patchState(store, { resized });
    },
    reset() {
      patchState(store, initialState);
    },
  })),
);
