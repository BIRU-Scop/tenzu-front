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

import { ProjectApiService } from "./project-api.service";
import { projectDetailSchema, projectSummarySchema } from "./project.model";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makeProjectDetail, makeProjectSummary } from "@tenzu/utils/testing/factories";

describe(ProjectApiService.name, () => {
  let service: ProjectApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(ProjectApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it("list / get with conforming value", async () => {
    const summary = makeProjectSummary({ id: "project-1" });
    const listPromise = lastValueFrom(service.list({ workspaceId: "workspace-1" }));
    httpMock.expectOne(`${BASE}/workspaces/workspace-1/projects`).flush({ data: [summary] });
    expect(await listPromise).toEqual([summary]);

    const detail = makeProjectDetail({ id: "project-1" });
    const getPromise = lastValueFrom(service.get({ projectId: "project-1" }));
    httpMock.expectOne(`${BASE}/projects/project-1`).flush({ data: detail });
    expect(await getPromise).toEqual(detail);
  });

  it("throws on a non-conforming case", async () => {
    const raw = { ...makeProjectSummary({ id: "project-1" }), color: "red" };
    const listPromise = lastValueFrom(service.list({ workspaceId: "workspace-1" }));

    httpMock.expectOne(`${BASE}/workspaces/workspace-1/projects`).flush({ data: [raw] });

    await expect(listPromise).rejects.toThrow();
  });

  it("factories produce valid payloads", () => {
    expect(() => projectSummarySchema.parse(makeProjectSummary())).not.toThrow();
    expect(() => projectDetailSchema.parse(makeProjectDetail())).not.toThrow();
  });
});
