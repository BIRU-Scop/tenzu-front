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

import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { FeedStore } from "./feed.store";
import { makeFeedItem } from "@tenzu/utils/testing/factories";

describe("FeedStore", () => {
  let store: InstanceType<typeof FeedStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(FeedStore);
  });

  it("unreadCount", () => {
    store.setAllEntities([
      makeFeedItem({ id: "m1" }),
      makeFeedItem({ id: "m2" }),
      makeFeedItem({ id: "m3", readAt: "2026-01-02T00:00:00.000Z" }),
    ]);

    expect(store.sortedEntities()).toHaveLength(3);
    expect(store.unreadCount()).toBe(2);
    store.setEntity(makeFeedItem({ id: "m3" }));
    expect(store.unreadCount()).toBe(3);
  });

  it("hasMaintenance", () => {
    store.setAllEntities([
      makeFeedItem({ id: "release", type: "release" }),
      makeFeedItem({ id: "survey", type: "callToAction" }),
    ]);
    expect(store.hasMaintenance()).toBe(false);

    store.setEntity(makeFeedItem({ id: "maintenance", type: "maintenance" }));

    expect(store.hasMaintenance()).toBe(true);
  });

  it("test the sorting of items()", () => {
    const release = makeFeedItem({ id: "release", type: "release", publicationDate: "2026-01-01T00:00:00.000Z" });
    const survey = makeFeedItem({ id: "survey", type: "callToAction", publicationDate: "2026-03-01T00:00:00.000Z" });
    const maintenance = makeFeedItem({
      id: "maintenance",
      type: "maintenance",
      publicationDate: "2026-02-01T00:00:00.000Z",
    });

    store.setAllEntities([release, survey, maintenance]);

    expect(store.sortedEntities().map((item) => item.id)).toEqual(["maintenance", "survey", "release"]);
  });
});
