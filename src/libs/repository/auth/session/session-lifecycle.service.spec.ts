/*
 * Copyright (C) 2025-2026 BIRU
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
import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";

import { SessionLifecycleService } from "./session-lifecycle.service";
import { ExitReason } from "./session-machine";
import { SessionChannelService } from "./session-channel.service";
import { TokenRepositoryService } from "../token/token-repository.service";
import { TokenInvalidation } from "../token/token-machine";
import { ExitReasonStore } from "../stores/exit-reason.store";
import { RememberedNextStore } from "../stores/remembered-next.store";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { ResetService } from "@tenzu/repository/base/reset.service";
import { Tokens } from "../auth.model";
import { makeTokens } from "../auth.factories";
import { WsService } from "@tenzu/utils/services/ws";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";

const REASONS: ExitReason[] = [
  "logoutRequested",
  "passwordChanged",
  "tokensCleared",
  "accountSwitched",
  "refreshRefused",
  "refreshExpired",
  "accountDeleted",
];

describe("SessionLifecycleService", () => {
  const tokenRepositoryServiceMock = {
    hasUsableRefresh: signal(false),
    tokens: signal<Tokens | null>(makeTokens()),
    set: vi.fn(),
    clear: vi.fn(),
    invalidated$: new Subject<TokenInvalidation>(),
  };
  const exitReasonStoreMock = { remember: vi.fn(), clear: vi.fn() };
  const sessionChannelServiceMock = { announceEnded: vi.fn(), ended$: new Subject<ExitReason>() };
  const rememberedNextStoreMock = { take: vi.fn<(username: string) => string | null>(), remember: vi.fn() };
  const routerMock = { navigateByUrl: vi.fn(() => Promise.resolve(true)), url: "/workspace/1" };
  const wsServiceMock = mockService(WsService);
  const matDialogMock = mockService(MatDialog);
  const resetServiceMock = mockService(ResetService);

  beforeEach(() => {
    vi.resetAllMocks();
    tokenRepositoryServiceMock.hasUsableRefresh.set(false);
    rememberedNextStoreMock.take.mockReturnValue(null);
    routerMock.navigateByUrl.mockResolvedValue(true);
    routerMock.url = "/workspace/1";
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: TokenRepositoryService, useValue: tokenRepositoryServiceMock },
        { provide: ExitReasonStore, useValue: exitReasonStoreMock },
        { provide: SessionChannelService, useValue: sessionChannelServiceMock },
        { provide: RememberedNextStore, useValue: rememberedNextStoreMock },
        { provide: Router, useValue: routerMock },
        { provide: WsService, useValue: wsServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: ResetService, useValue: resetServiceMock },
      ],
    });
  });

  const tokens = makeTokens({ username: "alice" });

  const startSession = (): SessionLifecycleService => {
    const sessionLifecycleService = TestBed.inject(SessionLifecycleService);
    sessionLifecycleService.sessionStarted(tokens);
    return sessionLifecycleService;
  };

  describe("boot", () => {
    it("SessionLifecycleService starts loggedIn when tokenRepositoryService.hasUsableRefresh is true", () => {
      tokenRepositoryServiceMock.hasUsableRefresh.set(true);

      const sessionLifecycleService = TestBed.inject(SessionLifecycleService);

      expect(sessionLifecycleService.step()).toBe("loggedIn");
    });

    it("SessionLifecycleService starts loggedOut when tokenRepositoryService.hasUsableRefresh is false", () => {
      const sessionLifecycleService = TestBed.inject(SessionLifecycleService);

      expect(sessionLifecycleService.step()).toBe("loggedOut");
    });

    it("SessionLifecycleService does not call router.navigateByUrl at boot", () => {
      TestBed.inject(SessionLifecycleService);

      expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe("sessionStarted, reaction loggedIn", () => {
    it("sessionStarted calls tokenRepositoryService.set with the tokens", () => {
      startSession();

      expect(tokenRepositoryServiceMock.set).toHaveBeenCalledExactlyOnceWith(tokens);
    });

    it("sessionStarted calls configAppService.regenerateCorrelationId", () => {
      const regenerateCorrelationId = vi.spyOn(TestBed.inject(ConfigAppService), "regenerateCorrelationId");

      startSession();

      expect(regenerateCorrelationId).toHaveBeenCalledOnce();
    });

    it("sessionStarted calls wsService.command with signin and the access token", () => {
      startSession();

      expect(wsServiceMock.command).toHaveBeenCalledExactlyOnceWith({ command: "signin", token: tokens.access });
    });

    it("sessionStarted calls router.navigateByUrl with the next returned by rememberedNextStore.take for the username", () => {
      rememberedNextStoreMock.take.mockReturnValue("/workspace/2/projects");

      startSession();

      expect(rememberedNextStoreMock.take).toHaveBeenCalledExactlyOnceWith("alice");
      expect(routerMock.navigateByUrl).toHaveBeenCalledExactlyOnceWith("/workspace/2/projects");
    });

    it("sessionStarted calls router.navigateByUrl with / when rememberedNextStore.take returns null", () => {
      startSession();

      expect(routerMock.navigateByUrl).toHaveBeenCalledExactlyOnceWith("/");
    });

    it("sessionStarted with next calls rememberedNextStore.remember with next and the username of the tokens", () => {
      TestBed.inject(SessionLifecycleService).sessionStarted(tokens, "/workspace/2/projects");

      expect(rememberedNextStoreMock.remember).toHaveBeenCalledExactlyOnceWith("/workspace/2/projects", "alice");
    });

    it("sessionStarted without next does not call rememberedNextStore.remember", () => {
      startSession();

      expect(rememberedNextStoreMock.remember).not.toHaveBeenCalled();
    });

    it("sessionStarted with next calls rememberedNextStore.remember before rememberedNextStore.take", () => {
      TestBed.inject(SessionLifecycleService).sessionStarted(tokens, "/workspace/2/projects");

      expect(rememberedNextStoreMock.remember.mock.invocationCallOrder[0]).toBeLessThan(
        rememberedNextStoreMock.take.mock.invocationCallOrder[0],
      );
    });

    it("sessionStarted does not call tokenRepositoryService.set when step is loggedIn", () => {
      const sessionLifecycleService = startSession();
      tokenRepositoryServiceMock.set.mockClear();

      sessionLifecycleService.sessionStarted(tokens);

      expect(tokenRepositoryServiceMock.set).not.toHaveBeenCalled();
    });
  });

  describe("endSession, reaction tearingDown", () => {
    it("endSession calls wsService.command with signout_local", () => {
      startSession().endSession({ reason: "logoutRequested" });

      expect(wsServiceMock.command).toHaveBeenCalledWith({ command: "signout_local" });
    });

    it.each(["logoutRequested", "passwordChanged", "refreshRefused", "refreshExpired", "accountDeleted"] as const)(
      "endSession calls sessionChannelService.announceEnded with %s",
      (reason) => {
        startSession().endSession({ reason });

        expect(sessionChannelServiceMock.announceEnded).toHaveBeenCalledExactlyOnceWith(reason);
      },
    );

    it.each(["tokensCleared", "accountSwitched"] as const)(
      "endSession does not call sessionChannelService.announceEnded for %s",
      (reason) => {
        startSession().endSession({ reason });

        expect(sessionChannelServiceMock.announceEnded).not.toHaveBeenCalled();
      },
    );

    it("endSession does not call sessionChannelService.announceEnded when the event carries fromChannel", () => {
      startSession().endSession({ reason: "refreshExpired", fromChannel: true });

      expect(sessionChannelServiceMock.announceEnded).not.toHaveBeenCalled();
    });

    it("endSession calls matDialog.closeAll", () => {
      startSession().endSession({ reason: "logoutRequested" });

      expect(matDialogMock.closeAll).toHaveBeenCalledOnce();
    });

    it.each(
      REASONS.map((reason) => ({ reason, revoke: reason === "logoutRequested" || reason === "passwordChanged" })),
    )("endSession calls tokenRepositoryService.clear with revoke $revoke for $reason", ({ reason, revoke }) => {
      startSession().endSession({ reason });

      expect(tokenRepositoryServiceMock.clear).toHaveBeenCalledExactlyOnceWith({ revoke });
    });

    it.each(["logoutRequested", "passwordChanged"] as const)(
      "endSession calls tokenRepositoryService.clear with revoke false for %s when the event carries fromChannel",
      (reason) => {
        startSession().endSession({ reason, fromChannel: true });

        expect(tokenRepositoryServiceMock.clear).toHaveBeenCalledExactlyOnceWith({ revoke: false });
      },
    );

    it("endSession calls resetService.reset", () => {
      startSession().endSession({ reason: "logoutRequested" });

      expect(resetServiceMock.reset).toHaveBeenCalledOnce();
    });

    it("endSession sets step to loggedOut", () => {
      const sessionLifecycleService = startSession();

      sessionLifecycleService.endSession({ reason: "logoutRequested" });

      expect(sessionLifecycleService.step()).toBe("loggedOut");
    });

    it("endSession does not call wsService.command when step is loggedOut", () => {
      TestBed.inject(SessionLifecycleService).endSession({ reason: "logoutRequested" });

      expect(wsServiceMock.command).not.toHaveBeenCalled();
    });
  });

  describe("endSession, reaction loggedOut", () => {
    it.each(REASONS)("endSession calls exitReasonStore.remember with %s and fromChannel false for %s", (reason) => {
      startSession().endSession({ reason });

      expect(exitReasonStoreMock.remember).toHaveBeenCalledExactlyOnceWith(reason, false);
    });

    it("endSession calls exitReasonStore.remember with logoutRequested and fromChannel true when the event carries fromChannel", () => {
      startSession().endSession({ reason: "logoutRequested", fromChannel: true });

      expect(exitReasonStoreMock.remember).toHaveBeenCalledExactlyOnceWith("logoutRequested", true);
    });

    it.each(["tokensCleared", "refreshRefused", "refreshExpired"] as const)(
      "endSession calls rememberedNextStore.remember with router.url and the username for %s",
      (reason) => {
        startSession().endSession({ reason });

        expect(rememberedNextStoreMock.remember).toHaveBeenCalledExactlyOnceWith("/workspace/1", "alice");
      },
    );

    it.each(["logoutRequested", "passwordChanged", "accountSwitched", "accountDeleted"] as const)(
      "endSession does not call rememberedNextStore.remember for %s",
      (reason) => {
        startSession().endSession({ reason });

        expect(rememberedNextStoreMock.remember).not.toHaveBeenCalled();
      },
    );

    it("endSession calls router.navigateByUrl with /login", () => {
      startSession().endSession({ reason: "logoutRequested" });

      expect(routerMock.navigateByUrl).toHaveBeenLastCalledWith("/login");
    });

    it("endSession calls exitReasonStore.remember with the stronger reason when a stronger exit arrives during resetService.reset", () => {
      const sessionLifecycleService = startSession();
      resetServiceMock.reset.mockImplementation(() => sessionLifecycleService.endSession({ reason: "accountDeleted" }));

      sessionLifecycleService.endSession({ reason: "refreshExpired" });

      expect(exitReasonStoreMock.remember).toHaveBeenCalledExactlyOnceWith("accountDeleted", false);
    });
  });

  describe("subscriptions", () => {
    it.each(["refreshExpired", "refreshRefused", "tokensCleared", "accountSwitched"] as const)(
      "invalidated$ emitting %s calls exitReasonStore.remember with %s and fromChannel false",
      (invalidation) => {
        startSession();

        tokenRepositoryServiceMock.invalidated$.next(invalidation);

        expect(exitReasonStoreMock.remember).toHaveBeenCalledExactlyOnceWith(invalidation, false);
      },
    );

    it("ended$ emitting a reason calls exitReasonStore.remember with the reason and fromChannel true", () => {
      startSession();

      sessionChannelServiceMock.ended$.next("refreshExpired");

      expect(exitReasonStoreMock.remember).toHaveBeenCalledExactlyOnceWith("refreshExpired", true);
    });

    it("ended$ emitting a reason does not call sessionChannelService.announceEnded", () => {
      startSession();

      sessionChannelServiceMock.ended$.next("refreshExpired");

      expect(sessionChannelServiceMock.announceEnded).not.toHaveBeenCalled();
    });
  });
});
