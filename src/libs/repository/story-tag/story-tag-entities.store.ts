/*
 * Copyright (C) 2026 BIRU
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

import { signalStore, withMethods } from "@ngrx/signals";
import { StoryTagWithCount } from "./story-tag.model";
import { withEntityDetailStore, withEntityListFeature } from "../base/features";

export const StoryTagEntitiesSummaryStore = signalStore(
  { providedIn: "root" },
  withEntityListFeature<StoryTagWithCount>(),
  withMethods((store) => ({
    decrementStoryCount(storyTagId: StoryTagWithCount["id"]) {
      const storyTag = store.entityMap()[storyTagId];
      if (!storyTag) {
        return;
      }
      store.updateEntity(storyTag.id, { storiesCount: Math.max(0, storyTag.storiesCount - 1) });
    },
  })),
);

export const StoryTagDetailStore = signalStore({ providedIn: "root" }, withEntityDetailStore<StoryTagWithCount>());
