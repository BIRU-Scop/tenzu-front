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

import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { FeedApiService } from "./feed-api.service";
import { FeedStore } from "./feed.store";
@Injectable({
  providedIn: "root",
})
export class FeedRepositoryService {
  private readonly api = inject(FeedApiService);
  private readonly store = inject(FeedStore);
  sortedEntities = this.store.sortedEntities;
  unreadCount = this.store.unreadCount;
  hasMaintenance = this.store.hasMaintenance;

  async listRequest() {
    const items = await lastValueFrom(this.api.list());
    this.store.setAllEntities(items);
    return items;
  }

  async markRead(params: { ids: string[] }) {
    const readStates = await lastValueFrom(this.api.markRead({ ids: params.ids }));
    this.store.updateReadState(readStates);
  }
}
