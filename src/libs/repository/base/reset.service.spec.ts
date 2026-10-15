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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ResetService } from "./reset.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { FeedStore } from "../feed/feed.store";
import { NotificationsStore } from "../notifications/notifications.store";
import { ProjectImportationEntitiesStore } from "../importation/project-importation.store";
import { BreadcrumbStore } from "../breadcrumb/breadcrumb.store";
import { AuthConfigStore } from "../auth/auth-config.store";
import { makeFeedItem } from "../feed/feed.factories";
import { makeProjectImportation } from "../importation/importation.factories";

describe("ResetService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
  });

  it("resets every registered service", () => {
    const feed = TestBed.inject(FeedStore);
    const notifications = TestBed.inject(NotificationsStore);
    const importations = TestBed.inject(ProjectImportationEntitiesStore);
    const breadcrumb = TestBed.inject(BreadcrumbStore);
    feed.setAllEntities([makeFeedItem()]);
    notifications.updateCount({ total: 3, read: 1, unread: 2 });
    importations.setAllEntities([makeProjectImportation()]);
    breadcrumb.setPathComponent("workspaceMembers");

    TestBed.inject(ResetService).reset();

    expect(feed.entities()).toEqual([]);
    expect(notifications.count()).toEqual({ total: 0, read: 0, unread: 0 });
    expect(importations.entities()).toEqual([]);
    expect(breadcrumb.keyPathComponent()).toBeUndefined();
  });

  it("resets a service once however many times it registered", () => {
    const resetService = TestBed.inject(ResetService);
    let resetCount = 0;
    const service = { resetAll: () => (resetCount += 1) };
    resetService.register(service);
    resetService.register(service);

    resetService.reset();

    expect(resetCount).toBe(1);
  });

  it("reports a store whose state survived its own reset", () => {
    const handleError = vi.spyOn(TestBed.inject(ErrorHandler), "handleError").mockImplementation(() => undefined);
    const resetService = TestBed.inject(ResetService);
    resetService.register({ resetAll: () => undefined, hasResidualState: () => true });

    resetService.reset();

    expect(handleError).toHaveBeenCalled();
  });

  it("completes the teardown even when a store fails to clear itself", () => {
    vi.spyOn(TestBed.inject(ErrorHandler), "handleError").mockImplementation(() => undefined);
    const resetService = TestBed.inject(ResetService);
    let laterServiceWasReset = false;
    resetService.register({ resetAll: () => undefined, hasResidualState: () => true });
    resetService.register({ resetAll: () => (laterServiceWasReset = true) });

    resetService.reset();

    expect(laterServiceWasReset).toBe(true);
  });

  it("does not touch a service that never registered", () => {
    const authConfig = TestBed.inject(AuthConfigStore);
    authConfig.setProviders([{ id: "gitlab", name: "GitLab", clientId: "client-1" }]);

    TestBed.inject(ResetService).reset();

    expect(authConfig.entities()).toHaveLength(1);
  });
  it("reset calls every beforeReset before any resetAll", () => {
    const resetService = TestBed.inject(ResetService);
    const first = { beforeReset: vi.fn(), resetAll: vi.fn() };
    const second = { resetAll: vi.fn() };
    resetService.register(first);
    resetService.register(second);

    resetService.reset();

    expect(first.beforeReset.mock.invocationCallOrder[0]).toBeLessThan(first.resetAll.mock.invocationCallOrder[0]);
    expect(first.beforeReset.mock.invocationCallOrder[0]).toBeLessThan(second.resetAll.mock.invocationCallOrder[0]);
    expect(second.resetAll).toHaveBeenCalledOnce();
  });
});
