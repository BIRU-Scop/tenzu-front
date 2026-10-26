/*
 * Copyright (C) 2024-2026 BIRU
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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { Tokens } from "@tenzu/repository/auth/auth.model";
import { effect, signal } from "@angular/core";
import { HttpTestingController } from "@angular/common/http/testing";

import { WsService } from "./ws.service";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { SessionStep } from "@tenzu/repository/auth/session/session-machine";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { WSResponseAction } from "../ws.model";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { makeProjectDetail } from "@tenzu/repository/project/project.factories";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";

const PROJECT_ID = "project-1";

const rejectedSignin: WSResponseAction = {
  type: "action",
  status: "error",
  action: { command: "signin" },
  content: { detail: "invalid-credentials" },
};

describe(WsService.name, () => {
  const stepMock = signal<SessionStep>("loggedIn");
  const sessionLifecycleServiceMock = { step: stepMock, endSession: vi.fn() };
  const tokenRepositoryServiceMock = {
    tokens: signal<Tokens | null>(makeTokens()),
    rotate: vi.fn<() => Promise<Tokens>>(),
    getAccessToken: vi.fn<() => Promise<string | null>>(),
  };
  let wsService: WsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    stepMock.set("loggedIn");
    sessionLifecycleServiceMock.endSession.mockReset();
    tokenRepositoryServiceMock.rotate.mockReset();
    tokenRepositoryServiceMock.getAccessToken.mockReset();
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: SessionLifecycleService, useValue: sessionLifecycleServiceMock },
        { provide: TokenRepositoryService, useValue: tokenRepositoryServiceMock },
      ],
    });
    wsService = TestBed.inject(WsService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("a signout action received from the server does not call sessionLifecycleService.endSession", async () => {
    await wsService.dispatchAction({
      type: "action",
      status: "ok",
      action: { command: "signout" },
      content: { channel: "users.user-1" },
    });

    expect(sessionLifecycleServiceMock.endSession).not.toHaveBeenCalled();
  });

  it("a signout action received from the server leaves channelSubscribed unchanged", async () => {
    wsService.channelSubscribed.set({ channelWorkspaces: ["workspaces.1"], channelProjects: [] });

    await wsService.dispatchAction({
      type: "action",
      status: "ok",
      action: { command: "signout" },
      content: { channel: "users.user-1" },
    });

    expect(wsService.channelSubscribed()).toEqual({ channelWorkspaces: ["workspaces.1"], channelProjects: [] });
  });

  const sentCommands = (): unknown[] => {
    const sent: unknown[] = [];
    (wsService as unknown as { subject: { next: (value: unknown) => void } }).subject = {
      next: (value) => sent.push(value),
    };
    return sent;
  };

  const settled = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

  it("a signin refused by the server calls tokenRepositoryService.rotate once", async () => {
    tokenRepositoryServiceMock.rotate.mockReturnValue(new Promise(() => undefined));

    await wsService.dispatchAction(rejectedSignin);

    expect(tokenRepositoryServiceMock.rotate).toHaveBeenCalledOnce();
  });

  it("a signin refused by the server sends signin with the access token resolved by rotate", async () => {
    tokenRepositoryServiceMock.rotate.mockResolvedValue(makeTokens({ access: "access-token-2" }));
    const sent = sentCommands();

    await wsService.dispatchAction(rejectedSignin);
    await settled();

    expect(sent).toEqual([{ command: "signin", token: "access-token-2" }]);
  });

  it("a signin refused by the server does not call sessionLifecycleService.endSession when tokenRepositoryService.rotate rejects", async () => {
    tokenRepositoryServiceMock.rotate.mockRejectedValue(new Error("refresh refused"));

    await wsService.dispatchAction(rejectedSignin);
    await settled();

    expect(sessionLifecycleServiceMock.endSession).not.toHaveBeenCalled();
  });

  const tagCreatedElsewhere = {
    type: "event" as const,
    channel: `projects.${PROJECT_ID}`,
    event: {
      type: "storiestags.create",
      content: { storyTag: makeStoryTagWithCount({ id: "tag-1", label: "urgent" }) },
      correlationId: "another-tab",
    },
  };

  it("a storiestags.create event received while step is loggedIn adds the story tag to StoryTagEntitiesSummaryStore", async () => {
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: PROJECT_ID }));

    await wsService.dispatchEvent(tagCreatedElsewhere);

    expect(TestBed.inject(StoryTagEntitiesSummaryStore).entities()).toHaveLength(1);
  });

  it("a storiestags.create event received while step is tearingDown leaves StoryTagEntitiesSummaryStore unchanged", async () => {
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: PROJECT_ID }));
    stepMock.set("tearingDown");

    await wsService.dispatchEvent(tagCreatedElsewhere);

    expect(TestBed.inject(StoryTagEntitiesSummaryStore).entities()).toEqual([]);
  });

  it("a storiestags.create event received while step is loggedOut leaves StoryTagEntitiesSummaryStore unchanged", async () => {
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: PROJECT_ID }));
    stepMock.set("loggedOut");

    await wsService.dispatchEvent(tagCreatedElsewhere);

    expect(TestBed.inject(StoryTagEntitiesSummaryStore).entities()).toEqual([]);
  });

  const projectSubscribed: WSResponseAction = {
    type: "action",
    status: "ok",
    action: { command: "subscribe_to_project_events" },
    content: { channel: `projects.${PROJECT_ID}` },
  };

  it("a subscribe_to_project_events action received while step is loggedIn sets channelSubscribed with the project", async () => {
    await wsService.dispatchAction(projectSubscribed);

    expect(wsService.channelSubscribed().channelProjects).toEqual([`projects.${PROJECT_ID}`]);
  });

  it("a subscribe_to_project_events action received while step is tearingDown leaves channelSubscribed unchanged", async () => {
    stepMock.set("tearingDown");

    await wsService.dispatchAction(projectSubscribed);

    expect(wsService.channelSubscribed().channelProjects).toEqual([]);
  });

  it("a subscribe_to_project_events action received while step is loggedOut leaves channelSubscribed unchanged", async () => {
    stepMock.set("loggedOut");

    await wsService.dispatchAction(projectSubscribed);

    expect(wsService.channelSubscribed().channelProjects).toEqual([]);
  });

  it("command subscribe sets channelSubscribed to a new object", async () => {
    const before = wsService.channelSubscribed();

    await wsService.dispatchAction(projectSubscribed);

    expect(wsService.channelSubscribed()).not.toBe(before);
  });

  it("notifies subscribers when the channel list changes", async () => {
    const seen: number[] = [];
    TestBed.runInInjectionContext(() => {
      effect(() => seen.push(wsService.channelSubscribed().channelProjects.length));
    });
    TestBed.tick();

    await wsService.manageSubscription({
      type: "action",
      status: "ok",
      action: { command: "subscribe_to_project_events" },
      content: { channel: `projects.${PROJECT_ID}` },
    });
    TestBed.tick();

    expect(seen).toEqual([0, 1]);
  });

  it("command signout_local sends signout_local when no signin response was received", () => {
    const sent = sentCommands();
    wsService.loggedSubject.next(false);

    wsService.command({ command: "signout_local" });

    expect(sent).toEqual([{ command: "signout_local" }]);
  });

  it("command signout_local sets channelSubscribed to { channelWorkspaces: [], channelProjects: [] }", () => {
    sentCommands();
    wsService.channelSubscribed.set({
      channelWorkspaces: ["workspaces.1"],
      channelProjects: [`projects.${PROJECT_ID}`],
    });

    wsService.command({ command: "signout_local" });

    expect(wsService.channelSubscribed()).toEqual({ channelWorkspaces: [], channelProjects: [] });
  });
});
