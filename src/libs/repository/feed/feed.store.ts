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

import { computed } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods } from "@ngrx/signals";
import { updateEntity } from "@ngrx/signals/entities";
import { withEntityListFeature, withTreeShakableDevTools } from "../base/features";
import { FeedItem, FeedItemReadState } from "./feed-item.model";

function typeRank(item: FeedItem): number {
  return item.type === "maintenance" ? 0 : 1;
}

export const FeedStore = signalStore(
  { providedIn: "root" },
  withTreeShakableDevTools("feeds"),
  withEntityListFeature<FeedItem>(),
  withComputed((store) => ({
    sortedEntities: computed<FeedItem[]>(() =>
      [...store.entities()].sort(
        (a, b) => typeRank(a) - typeRank(b) || Date.parse(b.publicationDate) - Date.parse(a.publicationDate),
      ),
    ),
    unreadCount: computed<number>(() => store.entities().filter((item) => !item.readAt).length),
  })),
  withMethods((store) => ({
    updateReadState(readStates: FeedItemReadState[]) {
      patchState(
        store,
        ...readStates.map((rs) => updateEntity<FeedItem>({ id: rs.id, changes: { readAt: rs.readAt } })),
      );
    },
  })),
);
