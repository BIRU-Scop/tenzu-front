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
import { StoryComment } from "./story-comment.model";
import { withEntityDetailStore, withEntityListFeature } from "@tenzu/repository/base";
import { StorySummary } from "@tenzu/repository/story";

const initialState = {
  currentStoryRef: null as StorySummary["ref"] | null,
  offset: 0 as number,
  listIsComplete: false as boolean,
};
export const StoryCommentEntitiesSummaryStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntityListFeature<StoryComment, typeof initialState>({ initialState }),
  withMethods((store) => ({
    setCurrentStoryRef(storyRef: StorySummary["ref"]) {
      patchState(store, { currentStoryRef: storyRef });
    },
    updateListState(offset: number, listIsComplete: boolean) {
      patchState(store, { offset, listIsComplete });
    },
  })),
);
export const StoryCommentDetailStore = signalStore({ providedIn: "root" }, withEntityDetailStore<StoryComment>());
