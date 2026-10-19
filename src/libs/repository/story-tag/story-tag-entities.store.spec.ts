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
import { StoryTagEntitiesSummaryStore } from "./story-tag-entities.store";
import { makeStoryTagWithCount } from "./story-tag.factories";

describe("StoryTagEntitiesSummaryStore", () => {
  let store: InstanceType<typeof StoryTagEntitiesSummaryStore>;

  beforeEach(() => {
    store = TestBed.inject(StoryTagEntitiesSummaryStore);
  });

  describe("decrementStoryCount", () => {
    it("decrements the count of the given tag", () => {
      store.setAllEntities([makeStoryTagWithCount({ id: "tag-1", storiesCount: 4 })]);

      store.decrementStoryCount("tag-1");

      expect(store.entityMap()["tag-1"].storiesCount).toBe(3);
    });

    it("return zero instead of negative number", () => {
      store.setAllEntities([makeStoryTagWithCount({ id: "tag-1", storiesCount: 0 })]);

      store.decrementStoryCount("tag-1");

      expect(store.entityMap()["tag-1"].storiesCount).toBe(0);
    });

    it("ignores a tag missing from the store", () => {
      store.setAllEntities([makeStoryTagWithCount({ id: "tag-1", storiesCount: 4 })]);

      store.decrementStoryCount("tag-unknown");

      expect(store.entityMap()["tag-1"].storiesCount).toBe(4);
    });
  });
});
