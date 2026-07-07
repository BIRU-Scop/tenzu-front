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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";

import { WorkspaceApiService } from "./workspace-api.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makeWorkspaceDetail, makeWorkspaceSummary } from "./workspace.factories";

describe(WorkspaceApiService.name, () => {
  let service: WorkspaceApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(WorkspaceApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it("list parses conforming payload", async () => {
    const summary = makeWorkspaceSummary();
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/workspaces`).flush({ data: [summary] });

    expect(await promise).toEqual([summary]);
  });

  it("list throws on a non-conforming payload", async () => {
    const raw = { ...makeWorkspaceSummary(), color: "blue" };
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/workspaces`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });

  it("get parses the workspace detail", async () => {
    const detail = makeWorkspaceDetail();
    const promise = lastValueFrom(service.get({ workspaceId: "workspace-1" }));

    httpMock.expectOne(`${BASE}/workspaces/workspace-1`).flush({ data: detail });

    expect(await promise).toEqual(detail);
  });
});
