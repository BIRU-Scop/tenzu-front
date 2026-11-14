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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TestBed } from "@angular/core/testing";
import { ZodError } from "zod/v4";

import {
  applyProjectImportationEvent,
  applyStoryTagAssignmentEvent,
  applyStoryTagEvent,
  applyUserEvent,
} from "./apply-event.function";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { WSResponseEvent } from "../ws.model";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { makeProjectDetail } from "@tenzu/repository/project/project.factories";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "@tenzu/repository/story/story-entities.store";
import { makeStoryDetail, makeStoryNested, makeStorySummary } from "@tenzu/repository/story/story.factories";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";
import { translation } from "@tenzu/utils/testing/translation";
import { MatDialog } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { projectImportationErrorDialogId } from "@tenzu/shared/components/project-importation-error-dialog/project-importation-error-dialog.id";
import { makeProjectImportation } from "@tenzu/repository/importation/importation.factories";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership/workspace-membership-repository.service";
import { makeWorkspaceMembership } from "@tenzu/repository/workspace-membership/workspace-membership.factories";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership/project-membership-repository.service";
import { makeProjectMembership } from "@tenzu/repository/project-membership/project-membership.factories";

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

describe("applyUserEvent", () => {
  let userStore: InstanceType<typeof UserStore>;
  let endSession: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    userStore = TestBed.inject(UserStore);
    await userStore.patchMe(makeUser({ id: "user-1", fullName: "John Doe" }));
    endSession = vi.spyOn(TestBed.inject(SessionLifecycleService), "endSession").mockImplementation(() => undefined);
  });

  const dispatchUserEvent = (message: WSResponseEvent<unknown>) =>
    TestBed.runInInjectionContext(() => applyUserEvent(message));

  it("applyUserEvent calls sessionLifecycleService.endSession with accountDeleted on a users.delete event", async () => {
    await dispatchUserEvent(makeEvent("users.delete", { userId: "user-1" }, "users.user-1"));

    expect(endSession).toHaveBeenCalledExactlyOnceWith({ reason: "accountDeleted" });
  });

  it("ignores users.delete of another user", async () => {
    await dispatchUserEvent(makeEvent("users.delete", { userId: "user-2" }, "users.user-1"));

    expect(endSession).not.toHaveBeenCalled();
  });

  it("applies users.update of the current user to the user store", async () => {
    await dispatchUserEvent(
      makeEvent("users.update", { user: makeUser({ id: "user-1", fullName: "Jane Doe" }) }, "users.user-1"),
    );

    expect(userStore.myUser()).toEqual(makeUser({ id: "user-1", fullName: "Jane Doe" }));
  });

  it("ignores users.update if user.id is not the current user.id", async () => {
    await dispatchUserEvent(
      makeEvent("users.update", { user: makeUser({ id: "user-2", fullName: "Jane Doe" }) }, "users.user-1"),
    );

    expect(userStore.myUser()).toEqual(makeUser({ id: "user-1", fullName: "John Doe" }));
  });

  it("applies users.update to the workspace and project memberships of the user", async () => {
    const workspaceMembershipRepositoryService = TestBed.inject(WorkspaceMembershipRepositoryService);
    const projectMembershipRepositoryService = TestBed.inject(ProjectMembershipRepositoryService);
    const user = makeUser({ id: "user-2", fullName: "Jane Doe" });
    workspaceMembershipRepositoryService.addEntitySummary(
      makeWorkspaceMembership({ id: "workspace-membership-1", user: makeUser({ id: "user-2" }) }),
    );
    projectMembershipRepositoryService.addEntitySummary(
      makeProjectMembership({ id: "project-membership-1", user: makeUser({ id: "user-2" }) }),
    );

    await dispatchUserEvent(makeEvent("users.update", { user }, "users.user-1"));

    expect(workspaceMembershipRepositoryService.entityMap()["workspace-membership-1"].user).toEqual(user);
    expect(projectMembershipRepositoryService.entityMap()["project-membership-1"].user).toEqual(user);
  });

  it("rejects a non-conforming users.update payload and leaves the user store unchanged", async () => {
    const user = { ...userStore.myUser() };
    await expect(
      dispatchUserEvent(
        makeEvent("users.update", { user: { ...makeUser({ id: "user-1" }), color: "red" } }, "users.user-1"),
      ),
    ).rejects.toThrow(ZodError);
    expect(userStore.myUser()).toEqual(user);
  });
});
describe("applyProjectImportationEvent", () => {
  const liveAnnouncerMock = mockService(LiveAnnouncer);

  beforeEach(() => {
    vi.resetAllMocks();
    liveAnnouncerMock.announce.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [testingProviders, { provide: LiveAnnouncer, useValue: liveAnnouncerMock }],
    });
  });

  const dispatchImportationEvent = (message: WSResponseEvent<unknown>) =>
    TestBed.runInInjectionContext(() => applyProjectImportationEvent(message));

  it("announces the switch to import", async () => {
    await dispatchImportationEvent(
      makeEvent(
        "projectimportations.create",
        { projectImportation: makeProjectImportation({ sourceName: "backup.json" }), workspaceId: "workspace-1" },
        "workspaces.workspace-1",
      ),
    );

    expect(liveAnnouncerMock.announce).toHaveBeenCalledExactlyOnceWith(
      translation("project.new_project.upload.notifications.finished", { fileName: "backup.json" }),
    );
  });

  it("closes the error dialog of a deleted importation", async () => {
    const matDialog = TestBed.inject(MatDialog);
    const id = projectImportationErrorDialogId("importation-1");
    matDialog.open(DialogStub, { id });

    await dispatchImportationEvent(
      makeEvent(
        "projectimportations.delete",
        { projectImportationId: "importation-1", workspaceId: "workspace-1" },
        "workspaces.workspace-1",
      ),
    );

    await vi.waitFor(() => expect(matDialog.getDialogById(id)).toBeUndefined());
  });
});

@Component({ template: "" })
class DialogStub {}
