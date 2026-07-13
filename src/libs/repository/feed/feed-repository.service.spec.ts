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

import { beforeEach, describe, expect, it, Mocked } from "vitest";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { FeedRepositoryService } from "./feed-repository.service";
import { FeedApiService } from "./feed-api.service";
import { FeedStore } from "./feed.store";
import { makeFeedItem } from "@tenzu/utils/testing/factories";
import { mockService } from "@tenzu/utils/testing/mocks";

describe("FeedRepositoryService", () => {
  let repository: FeedRepositoryService;
  let store: InstanceType<typeof FeedStore>;
  let api: Mocked<FeedApiService>;

  beforeEach(() => {
    api = mockService(FeedApiService);
    TestBed.configureTestingModule({
      providers: [{ provide: FeedApiService, useValue: api }],
    });
    repository = TestBed.inject(FeedRepositoryService);
    store = TestBed.inject(FeedStore);
  });

  it("load", async () => {
    api.list.mockReturnValue(of([makeFeedItem({ id: "m1" }), makeFeedItem({ id: "m2" })]));

    await repository.listRequest();

    expect(store.sortedEntities()).toHaveLength(2);
  });

  it("unreadCount", async () => {
    store.setAllEntities([makeFeedItem({ id: "m1" }), makeFeedItem({ id: "m2" })]);
    expect(store.unreadCount()).toBe(2);
    api.markRead.mockReturnValue(
      of([
        { id: "m1", readAt: "2026-01-02T00:00:00.000Z" },
        { id: "m2", readAt: "2026-01-02T00:00:00.000Z" },
      ]),
    );
    await repository.markRead({ ids: ["m1", "m2"] });
    expect(api.markRead).toHaveBeenCalledWith({ ids: ["m1", "m2"] });
    expect(store.unreadCount()).toBe(0);
  });
});
