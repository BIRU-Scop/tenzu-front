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

import { ProjectMembershipApiService } from "./project-membership-api.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makeProjectMembership } from "./project-membership.factories";

describe(ProjectMembershipApiService.name, () => {
  let service: ProjectMembershipApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(ProjectMembershipApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it("list parses conforming payload", async () => {
    const membership = makeProjectMembership();
    const promise = lastValueFrom(service.list({ projectId: "project-1" }));

    httpMock.expectOne(`${BASE}/projects/project-1/memberships`).flush({ data: [membership] });

    expect(await promise).toEqual([membership]);
  });

  it("list throws on a non-conforming payload", async () => {
    const raw = { ...makeProjectMembership(), projectId: 123 };
    const promise = lastValueFrom(service.list({ projectId: "project-1" }));

    httpMock.expectOne(`${BASE}/projects/project-1/memberships`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });
});
