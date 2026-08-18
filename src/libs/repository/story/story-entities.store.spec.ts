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
import { StoryDetailStore, StoryEntitiesSummaryStore } from "./story-entities.store";
import { StoryReorderPayloadEvent } from "./story.model";
import { WorkflowStatusNested } from "../status/status.model";
import { makeStoryAssign, makeStoryDetail, makeStorySummary } from "../story/story.factories";
import { makeUserNested } from "../user/user.factories";

describe("StoryEntitiesSummaryStore", () => {
  let store: InstanceType<typeof StoryEntitiesSummaryStore>;

  beforeEach(() => {
    store = TestBed.inject(StoryEntitiesSummaryStore);
  });

  describe("setCurrentWorkflowId", () => {
    it("stores the current project and workflow", () => {
      store.setCurrentWorkflowId("project-9", "workflow-9");
      expect(store.currentProjectId()).toBe("project-9");
      expect(store.currentWorkflowId()).toBe("workflow-9");
    });
  });

  describe("reorder", () => {
    it("groups story refs by status", () => {
      store.addEntities([
        makeStorySummary({ ref: 1, statusId: "todo" }),
        makeStorySummary({ ref: 2, statusId: "done" }),
        makeStorySummary({ ref: 3, statusId: "todo" }),
      ]);

      store.reorder();

      expect(store.groupedByStatus()).toEqual({
        todo: [1, 3],
        done: [2],
      });
    });
  });

  describe("addAssign", () => {
    it("prepends the assignee to the story", () => {
      store.addEntities([makeStorySummary({ ref: 1, assigneeIds: ["user-a"] })]);

      store.addAssign(makeStoryAssign({ user: makeUserNested({ id: "user-b" }) }), 1);

      expect(store.entityMap()[1].assigneeIds).toEqual(["user-b", "user-a"]);
    });

    it("does not add the same assignee twice", () => {
      store.addEntities([makeStorySummary({ ref: 1, assigneeIds: ["user-a"] })]);

      store.addAssign(makeStoryAssign({ user: makeUserNested({ id: "user-a" }) }), 1);

      expect(store.entityMap()[1].assigneeIds).toEqual(["user-a"]);
    });

    it("ignores a story missing from the summary store", () => {
      expect(() => store.addAssign(makeStoryAssign({ user: makeUserNested({ id: "user-b" }) }), 404)).not.toThrow();
    });
  });

  describe("removeAssign", () => {
    it("removes the given assignee", () => {
      store.addEntities([makeStorySummary({ ref: 1, assigneeIds: ["user-a", "user-b"] })]);

      store.removeAssign(1, "user-a");

      expect(store.entityMap()[1].assigneeIds).toEqual(["user-b"]);
    });

    it("ignores a story missing from the summary store", () => {
      expect(() => store.removeAssign(404, "user-a")).not.toThrow();
    });
  });

  describe("removeTagFromStories", () => {
    it("purges the tag from every story referencing it", () => {
      store.addEntities([
        makeStorySummary({ ref: 1, tagIds: ["tag-x", "tag-keep"] }),
        makeStorySummary({ ref: 2, tagIds: ["tag-keep"] }),
        makeStorySummary({ ref: 3, tagIds: ["tag-x"] }),
      ]);

      store.removeTagFromStories("tag-x");

      expect(store.entityMap()[1].tagIds).toEqual(["tag-keep"]);
      expect(store.entityMap()[2].tagIds).toEqual(["tag-keep"]);
      expect(store.entityMap()[3].tagIds).toEqual([]);
    });
  });

  describe("deleteStatusGroup", () => {
    it("moves stories from the old status to the new one", () => {
      store.addEntities([
        makeStorySummary({ ref: 1, statusId: "old" }),
        makeStorySummary({ ref: 2, statusId: "keep" }),
      ]);
      const newStatus = { id: "new" } as WorkflowStatusNested;

      store.deleteStatusGroup("old", newStatus);

      expect(store.entityMap()[1].statusId).toBe("new");
      expect(store.entityMap()[2].statusId).toBe("keep");
      expect(store.groupedByStatus()).toEqual({ new: [1], keep: [2] });
    });
  });

  describe("reorderStoryByEvent", () => {
    it("updates the status of the moved story", () => {
      store.addEntities([
        makeStorySummary({ ref: 1, statusId: "todo" }),
        makeStorySummary({ ref: 2, statusId: "todo" }),
      ]);

      const event: StoryReorderPayloadEvent = {
        statusId: "done",
        stories: [1],
        status: { id: "done" } as WorkflowStatusNested,
      };
      store.reorderStoryByEvent(event);

      expect(store.entityMap()[1].statusId).toBe("done");
    });

    it("moves the story after its sibling when place is 'after'", () => {
      store.addEntities([
        makeStorySummary({ ref: 1, statusId: "todo" }),
        makeStorySummary({ ref: 2, statusId: "todo" }),
        makeStorySummary({ ref: 3, statusId: "todo" }),
      ]);

      const event: StoryReorderPayloadEvent = {
        statusId: "todo",
        stories: [1],
        reorder: { place: "after", ref: 3 },
        status: { id: "todo" } as WorkflowStatusNested,
      };
      store.reorderStoryByEvent(event);

      expect(store.groupedByStatus()["todo"]).toEqual([2, 3, 1]);
    });
  });
});

describe("StoryDetailStore", () => {
  let store: InstanceType<typeof StoryDetailStore>;

  beforeEach(() => {
    store = TestBed.inject(StoryDetailStore);
  });

  describe("removeTagFromStories", () => {
    it("purges the tag from the opened story", () => {
      store.set(makeStoryDetail({ ref: 5, tagIds: ["tag-x", "tag-keep"] }));

      store.removeTagFromStories("tag-x");

      expect(store.item()?.tagIds).toEqual(["tag-keep"]);
    });
  });

  describe("updateCommentsCount", () => {
    it("increments and decrements the comment count of the selected story", () => {
      store.set(makeStoryDetail({ ref: 5, totalComments: 2, assigneeIds: [] }));

      store.updateCommentsCount(5, 1);
      expect(store.item()?.totalComments).toBe(3);

      store.updateCommentsCount(5, -2);
      expect(store.item()?.totalComments).toBe(1);
    });

    it("ignores updates targeting another story", () => {
      store.set(makeStoryDetail({ ref: 5, totalComments: 2, assigneeIds: [] }));

      store.updateCommentsCount(99, 1);

      expect(store.item()?.totalComments).toBe(2);
    });
  });
});
