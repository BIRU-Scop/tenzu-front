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

import { StoryTagRepositoryService } from "./story-tag-repository.service";
import { StoryTagApiService } from "./story-tag-api.service";
import { StoryTagEntitiesSummaryStore } from "./story-tag-entities.store";
import { makeStoryTagWithCount } from "./story-tag.factories";
import { StoryApiService } from "../story/story-api.service";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "../story/story-entities.store";
import { makeStoryDetail, makeStorySummary } from "../story/story.factories";
import { mockService } from "@tenzu/utils/testing/mocks";

describe(StoryTagRepositoryService.name, () => {
  let repository: StoryTagRepositoryService;
  let store: InstanceType<typeof StoryTagEntitiesSummaryStore>;
  let api: Mocked<StoryTagApiService>;

  beforeEach(() => {
    api = mockService(StoryTagApiService);
    TestBed.configureTestingModule({
      providers: [
        { provide: StoryTagApiService, useValue: api },
        { provide: StoryApiService, useValue: mockService(StoryApiService) },
      ],
    });
    repository = TestBed.inject(StoryTagRepositoryService);
    store = TestBed.inject(StoryTagEntitiesSummaryStore);
  });

  it("list fills the store", async () => {
    const tags = [
      makeStoryTagWithCount({ id: "tag-1", label: "bug" }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature" }),
      makeStoryTagWithCount({ id: "tag-3", label: "urgent" }),
    ];
    api.list.mockReturnValue(of(tags));

    await repository.listRequest({ projectId: "project-1" });

    expect(store.entities()).toEqual(tags);
  });

  it("create adds the entity from the response", async () => {
    store.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug" }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature" }),
    ]);
    const created = makeStoryTagWithCount({ id: "tag-3", label: "urgent", color: 5, storiesCount: 0 });
    api.create.mockReturnValue(of(created));

    await repository.createRequest({ label: "Urgent!", color: 5 }, { projectId: "project-1" });

    expect(store.entities()).toHaveLength(3);
    expect(store.entityMap()["tag-3"]).toEqual(created);
  });

  it("patch replaces the entity", async () => {
    const tag = makeStoryTagWithCount({ id: "tag-1", label: "bug", color: 3, storiesCount: 4 });
    store.setAllEntities([tag]);
    const patched = { ...tag, label: "defect" };
    api.patch.mockReturnValue(of(patched));

    await repository.patchRequest("tag-1", { label: "defect", color: 3 }, { tagId: "tag-1" });

    expect(store.entityMap()["tag-1"]).toEqual(patched);
  });

  it("delete removes the entity", async () => {
    const bug = makeStoryTagWithCount({ id: "tag-1", label: "bug" });
    const feature = makeStoryTagWithCount({ id: "tag-2", label: "feature" });
    store.setAllEntities([bug, feature]);
    api.delete.mockReturnValue(of(undefined));

    await repository.deleteRequest(bug, { tagId: "tag-1" });

    expect(store.entities()).toEqual([feature]);
  });

  it("delete purges the tag id from the story stores", async () => {
    const bug = makeStoryTagWithCount({ id: "tag-1", label: "bug" });
    store.setAllEntities([bug]);
    const storiesStore = TestBed.inject(StoryEntitiesSummaryStore);
    storiesStore.setAllEntities([
      makeStorySummary({ ref: 1, tagIds: ["tag-1", "tag-keep"] }),
      makeStorySummary({ ref: 2, tagIds: ["tag-keep"] }),
    ]);
    const storyDetailStore = TestBed.inject(StoryDetailStore);
    storyDetailStore.set(makeStoryDetail({ ref: 1, tagIds: ["tag-1", "tag-keep"] }));
    api.delete.mockReturnValue(of(undefined));

    await repository.deleteRequest(bug, { tagId: "tag-1" });

    expect(storiesStore.entityMap()[1].tagIds).toEqual(["tag-keep"]);
    expect(storiesStore.entityMap()[2].tagIds).toEqual(["tag-keep"]);
    expect(storyDetailStore.item()?.tagIds).toEqual(["tag-keep"]);
  });
});
