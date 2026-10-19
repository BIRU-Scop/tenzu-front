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

import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { StoryApiService } from "./story-api.service";
import { StoryRepositoryService } from "./story-repository.service";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "./story-entities.store";
import { StoryReorderPayloadEvent } from "./story.model";
import { WorkflowStatusNested } from "../status/status.model";
import {
  makeStoryAssign,
  makeStoryDetail,
  makeStoryNested,
  makeStorySummary,
  makeStoryTagAssign,
} from "../story/story.factories";
import { makeStoryTagWithCount } from "../story-tag/story-tag.factories";
import { StoryTagEntitiesSummaryStore } from "../story-tag/story-tag-entities.store";
import { makeUserNested } from "../user/user.factories";
import { mockService } from "@tenzu/utils/testing/mocks";

describe("StoryRepositoryService", () => {
  let service: StoryRepositoryService;
  let summaryStore: InstanceType<typeof StoryEntitiesSummaryStore>;
  let detailStore: InstanceType<typeof StoryDetailStore>;
  let api: Mocked<StoryApiService>;

  beforeEach(() => {
    api = mockService(StoryApiService);
    TestBed.configureTestingModule({
      providers: [{ provide: StoryApiService, useValue: api }],
    });
    service = TestBed.inject(StoryRepositoryService);
    summaryStore = TestBed.inject(StoryEntitiesSummaryStore);
    detailStore = TestBed.inject(StoryDetailStore);
  });

  describe("createRequest", () => {
    it("creates via the api, stores the entity and regroups by status", async () => {
      const created = makeStoryDetail({ ref: 10, statusId: "todo" });
      api.create.mockReturnValue(of(created));

      const result = await service.createRequest({ title: "t", statusId: "todo" }, { workflowId: "wf-1" });

      expect(api.create).toHaveBeenCalledWith({ title: "t", statusId: "todo" }, { workflowId: "wf-1" });
      expect(result).toEqual(created);
      expect(summaryStore.entityMap()[10]).toEqual(created);
      expect(summaryStore.groupedByStatus()).toEqual({ todo: [10] });
    });
  });

  describe("listRequest", () => {
    it("loads a single page, fills the store and clears the loading flag", async () => {
      const stories = [makeStorySummary({ ref: 1, statusId: "a" }), makeStorySummary({ ref: 2, statusId: "b" })];
      api.list.mockReturnValue(of(stories));

      const result = await service.listRequest({ projectId: "p-1", workflowId: "wf-1" }, { limit: 50, offset: 0 });

      expect(api.list).toHaveBeenCalledTimes(1);
      expect(result).toEqual(stories);
      expect(summaryStore.entities()).toEqual(stories);
      expect(service.isLoading()).toBe(false);
    });

    it("paginates until a page smaller than the limit is returned", async () => {
      api.list
        .mockReturnValueOnce(of([makeStorySummary({ ref: 1 }), makeStorySummary({ ref: 2 })]))
        .mockReturnValueOnce(of([makeStorySummary({ ref: 3 })]));

      await service.listRequest({ projectId: "p-1", workflowId: "wf-1" }, { limit: 2, offset: 0 });

      expect(api.list).toHaveBeenCalledTimes(2);
      expect(summaryStore.entities().map((s) => s.ref)).toEqual([1, 2, 3]);
    });

    it("returns cached entities without hitting the api for the same project/workflow", async () => {
      api.list.mockReturnValue(of([makeStorySummary({ ref: 1 })]));

      await service.listRequest({ projectId: "p-1", workflowId: "wf-1" }, { limit: 50, offset: 0 });
      await service.listRequest({ projectId: "p-1", workflowId: "wf-1" }, { limit: 50, offset: 0 });

      expect(api.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("createAssign", () => {
    it("calls the api and adds the assignee to both stores", async () => {
      summaryStore.addEntities([makeStorySummary({ ref: 1, assigneeIds: [] })]);
      detailStore.set(makeStoryDetail({ ref: 1, assigneeIds: [] }));
      const user = makeUserNested({ id: "user-x" });
      api.createAssignee.mockReturnValue(of(makeStoryAssign({ user, story: makeStoryNested({ ref: 1, title: "t" }) })));

      await service.createAssign(user, { projectId: "p-1", ref: 1 });

      expect(api.createAssignee).toHaveBeenCalledWith("user-x", { projectId: "p-1", ref: 1 });
      expect(summaryStore.entityMap()[1].assigneeIds).toEqual(["user-x"]);
      expect(detailStore.item()?.assigneeIds).toEqual(["user-x"]);
    });
  });

  describe("deleteAssign", () => {
    it("calls the api and removes the assignee from both stores", async () => {
      summaryStore.addEntities([makeStorySummary({ ref: 1, assigneeIds: ["user-x", "user-y"] })]);
      detailStore.set(makeStoryDetail({ ref: 1, assigneeIds: ["user-x", "user-y"] }));
      const assignee = makeUserNested({ id: "user-x" });
      api.deleteAssignee.mockReturnValue(of(undefined));

      await service.deleteAssign(assignee, { projectId: "p-1", storyRef: 1 });

      expect(api.deleteAssignee).toHaveBeenCalledWith({ projectId: "p-1", ref: 1, userId: "user-x" });
      expect(summaryStore.entityMap()[1].assigneeIds).toEqual(["user-y"]);
      expect(detailStore.item()?.assigneeIds).toEqual(["user-y"]);
    });
  });

  describe("wsReorderStoryByEvent", () => {
    it("swallows NotFoundEntityError from the summary store and still updates the detail store", () => {
      // story absent from the summary store -> its reorder throws NotFoundEntityError
      detailStore.set(makeStoryDetail({ ref: 1, statusId: "todo" }));
      const event: StoryReorderPayloadEvent = {
        statusId: "done",
        stories: [1],
        status: { id: "done" } as WorkflowStatusNested,
      };

      expect(() => service.wsReorderStoryByEvent(event)).not.toThrow();
      expect(detailStore.item()?.statusId).toBe("done");
    });
  });

  describe("dropStoryIntoStatus", () => {
    it("calls the api reorder when the store returns a payload", async () => {
      const payload = { statusId: "done", stories: [1] };
      vi.spyOn(summaryStore, "dropStoryIntoStatus").mockReturnValue(payload);
      api.reorder.mockReturnValue(of(undefined));

      await service.dropStoryIntoStatus({} as never, "wf-1");

      expect(api.reorder).toHaveBeenCalledWith(payload, { workflowId: "wf-1" });
    });

    it("does not call the api when the store returns no payload", async () => {
      vi.spyOn(summaryStore, "dropStoryIntoStatus").mockReturnValue(undefined as never);

      await service.dropStoryIntoStatus({} as never, "wf-1");

      expect(api.reorder).not.toHaveBeenCalled();
    });
  });

  describe("updateCommentsCount", () => {
    it("delegates to the detail store", () => {
      detailStore.set(makeStoryDetail({ ref: 1 }));
      patchTotalComments(detailStore, 2);

      service.updateCommentsCount(1, 3);

      expect(detailStore.item()?.totalComments).toBe(5);
    });
  });

  describe("tag assignment", () => {
    it("createTagAssign adds the tagId to both stores", async () => {
      summaryStore.setAllEntities([makeStorySummary({ ref: 1, tagIds: [] })]);
      detailStore.set(makeStoryDetail({ ref: 1, tagIds: [] }));
      api.createTagAssignment.mockReturnValue(
        of(
          makeStoryTagAssign({
            tag: makeStoryTagWithCount({ id: "tag-1", storiesCount: 5 }),
            story: makeStoryNested({ ref: 1 }),
          }),
        ),
      );
      const tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
      tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", storiesCount: 0 })]);

      await service.createTagAssign("tag-1", { projectId: "project-1", ref: 1 });

      expect(summaryStore.entityMap()[1].tagIds).toEqual(["tag-1"]);
      expect(detailStore.item()?.tagIds).toEqual(["tag-1"]);
      expect(tagsStore.entityMap()["tag-1"].storiesCount).toBe(5);
    });

    it("deleteTagAssign removes the tagId from both stores and decrements the tag counter", async () => {
      summaryStore.setAllEntities([makeStorySummary({ ref: 1, tagIds: ["tag-1", "tag-2"] })]);
      detailStore.set(makeStoryDetail({ ref: 1, tagIds: ["tag-1", "tag-2"] }));
      api.deleteTagAssignment.mockReturnValue(of(undefined));

      const tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
      tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", storiesCount: 2 })]);

      await service.deleteTagAssign("tag-1", { projectId: "project-1", ref: 1 });

      expect(api.deleteTagAssignment).toHaveBeenCalledWith({ projectId: "project-1", ref: 1, tagId: "tag-1" });
      expect(summaryStore.entityMap()[1].tagIds).toEqual(["tag-2"]);
      expect(detailStore.item()?.tagIds).toEqual(["tag-2"]);
      expect(tagsStore.entityMap()["tag-1"].storiesCount).toBe(1);
    });
  });
});

function patchTotalComments(detailStore: InstanceType<typeof StoryDetailStore>, total: number) {
  const item = detailStore.item();
  if (item) {
    detailStore.set({ ...item, totalComments: total });
  }
}
