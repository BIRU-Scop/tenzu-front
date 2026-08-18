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
import { ZodError } from "zod/v4";

import { applyStoryTagAssignmentEvent, applyStoryTagEvent } from "./apply-event.function";
import { WSResponseEvent } from "../ws.model";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { makeProjectDetail } from "@tenzu/repository/project/project.factories";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "@tenzu/repository/story/story-entities.store";
import { makeStoryDetail, makeStoryNested, makeStorySummary } from "@tenzu/repository/story/story.factories";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

const PROJECT_ID = "project-1";

const makeEvent = (type: string, content: unknown, channel = `projects.${PROJECT_ID}`): WSResponseEvent<unknown> => ({
  type: "event",
  channel,
  event: { type, content, correlationId: "correlation-1" },
});

describe("applyStoryTagEvent", () => {
  let tagsStore: InstanceType<typeof StoryTagEntitiesSummaryStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: PROJECT_ID }));
    tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
  });

  const dispatchTagEvent = (message: WSResponseEvent<unknown>) =>
    TestBed.runInInjectionContext(() => applyStoryTagEvent(message));

  it("applies storiestags.update to the tag store", () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug", color: 3, storiesCount: 4 })]);

    dispatchTagEvent(
      makeEvent("storiestags.update", {
        storyTag: { ...makeStoryTagWithCount({ id: "tag-1", label: "defect", color: 5, storiesCount: 7 }) },
      }),
    );

    expect(tagsStore.entityMap()["tag-1"]).toEqual({
      id: "tag-1",
      projectId: "project-1",
      label: "defect",
      color: 5,
      storiesCount: 7,
    });
  });

  it("applies storiestags.delete to the tag store", () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug" })]);
    const storiesStore = TestBed.inject(StoryEntitiesSummaryStore);
    storiesStore.addEntities([
      makeStorySummary({ ref: 1, tagIds: ["tag-1", "tag-keep"] }),
      makeStorySummary({ ref: 2, tagIds: ["tag-keep"] }),
    ]);
    const storyDetailStore = TestBed.inject(StoryDetailStore);
    storyDetailStore.set(makeStoryDetail({ ref: 1, tagIds: ["tag-1", "tag-keep"] }));

    dispatchTagEvent(makeEvent("storiestags.delete", { storyTag: { ...makeStoryTagWithCount({ id: "tag-1" }) } }));

    expect(tagsStore.entityMap()["tag-1"]).toBeUndefined();
    expect(storiesStore.entityMap()[1].tagIds).toEqual(["tag-keep"]);
    expect(storiesStore.entityMap()[2].tagIds).toEqual(["tag-keep"]);
    expect(storyDetailStore.item()?.tagIds).toEqual(["tag-keep"]);
  });

  it("applies storiestags.create", () => {
    dispatchTagEvent(
      makeEvent("storiestags.create", { storyTag: { ...makeStoryTagWithCount({ id: "tag-new", label: "urgent" }) } }),
    );

    expect(tagsStore.entityMap()["tag-new"]).toEqual(makeStoryTagWithCount({ id: "tag-new", label: "urgent" }));
  });

  it("rejects a non-conforming payload and leaves the store unchanged", () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug" })]);

    expect(() =>
      dispatchTagEvent(
        makeEvent("storiestags.create", { storyTag: { ...makeStoryTagWithCount({ id: "tag-2" }), color: 42 } }),
      ),
    ).toThrow(ZodError);
    expect(tagsStore.entities()).toEqual([makeStoryTagWithCount({ id: "tag-1", label: "bug" })]);
  });
});

describe("applyStoryTagAssignmentEvent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: PROJECT_ID }));
  });

  const dispatchAssignmentEvent = (message: WSResponseEvent<unknown>) =>
    TestBed.runInInjectionContext(() => applyStoryTagAssignmentEvent(message));

  it("updates the tagIds of both story stores on create and delete", () => {
    const storiesStore = TestBed.inject(StoryEntitiesSummaryStore);
    storiesStore.addEntities([makeStorySummary({ ref: 1, tagIds: [] })]);
    const storyDetailStore = TestBed.inject(StoryDetailStore);
    storyDetailStore.set(makeStoryDetail({ ref: 1, tagIds: [] }));
    const content = {
      storyTagAssignment: {
        tag: { ...makeStoryTagWithCount({ id: "tag-1" }) },
        story: { ...makeStoryNested({ ref: 1 }) },
      },
    };

    dispatchAssignmentEvent(makeEvent("storiestagsassignments.create", content));

    expect(storiesStore.entityMap()[1].tagIds).toEqual(["tag-1"]);
    expect(storyDetailStore.item()?.tagIds).toEqual(["tag-1"]);

    dispatchAssignmentEvent(makeEvent("storiestagsassignments.delete", content));

    expect(storiesStore.entityMap()[1].tagIds).toEqual([]);
    expect(storyDetailStore.item()?.tagIds).toEqual([]);
  });
});
