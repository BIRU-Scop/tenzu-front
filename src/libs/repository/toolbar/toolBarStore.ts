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
export type ToolBarItem = {
  iconName: string;
  label: string;
  eventName: string;
  eventData?: any;
};

const initialState = {
  items: [],
};

export const ToolBarStore = signalStore(
  { providedIn: "root" },
  withState<{
    items: ToolBarItem[];
  }>(initialState),
  withMethods((store) => ({
    setItems(items: ToolBarItem[]) {
      patchState(store, { items });
    },
    reset() {
      patchState(store, initialState);
    },
  })),
);
