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

export type StoryView = "kanban" | "fullView" | "side-view";

export const KanbanWrapperStore = signalStore(
  { providedIn: "root" },
  withState({ storyView: "fullView" as StoryView, firstOpened: true, isOpenedSideview: false }),
  withMethods((store) => ({
    setStoryView(storyView: StoryView) {
      patchState(store, { storyView });
      localStorage.setItem("storyView", storyView);
    },
    setFirstOpened(firstOpened: boolean) {
      patchState(store, { firstOpened });
    },
    setSidenavStoryViewOpened(isOpenedSideview: boolean) {
      patchState(store, { isOpenedSideview });
    },
  })),
  withHooks({
    onInit(store) {
      const storyView = localStorage.getItem("storyView") || "kanban";
      store.setStoryView(storyView as StoryView);
    },
  }),
);
