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

import { UserService } from "./user.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { makeProjectLinkNested, makeProjectNested } from "@tenzu/repository/project/project.factories";
import { makeWorkspaceLinkNested, makeWorkspaceNested } from "@tenzu/repository/workspace/workspace.factories";

describe(UserService.name, () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it("getMyUser parses conforming payload", async () => {
    const user = makeUser();
    const promise = lastValueFrom(service.getMyUser());

    httpMock.expectOne(`${BASE}/users/me`).flush({ data: user });

    expect(await promise).toEqual(user);
  });

  it("getMyUser throws on a non-conforming payload", async () => {
    const raw = { ...makeUser(), color: "red" };
    const promise = lastValueFrom(service.getMyUser());

    httpMock.expectOne(`${BASE}/users/me`).flush({ data: raw });

    await expect(promise).rejects.toThrow();
  });

  it("resetPassword parses conforming payload", async () => {
    const tokens = { access: "access-token", refresh: "refresh-token", username: "jdoe" };
    const promise = lastValueFrom(service.resetPassword("reset-token", "new-password"));

    httpMock.expectOne(`${BASE}/users/reset-password/reset-token`).flush(tokens);

    expect(await promise).toEqual(tokens);
  });

  it("verifyUser parses conforming payload", async () => {
    const info = {
      auth: { access: "access-token", refresh: "refresh-token", username: "jdoe" },
      workspaceInvitation: { workspace: makeWorkspaceLinkNested(), status: "pending" },
      projectInvitationToken: { project: makeProjectLinkNested(), status: "pending" },
    };
    const promise = lastValueFrom(service.verifyUser("verify-token"));

    httpMock.expectOne(`${BASE}/users/verify`).flush(info);

    expect(await promise).toEqual(info);
  });

  it("getDeleteInfo parses conforming payload", async () => {
    const info = {
      onlyOwnerCollectiveWorkspaces: [makeWorkspaceNested({ id: "workspace-1" })],
      onlyOwnerCollectiveProjects: [makeProjectNested({ id: "project-1" })],
      onlyMemberWorkspaces: [{ ...makeWorkspaceNested({ id: "workspace-2" }), projects: [makeProjectLinkNested()] }],
      onlyMemberProjects: [makeProjectNested({ id: "project-3" })],
    };
    const promise = lastValueFrom(service.getDeleteInfo());

    httpMock.expectOne(`${BASE}/users/me/delete-info`).flush(info);

    expect(await promise).toEqual(info);
  });

  it("verifyResetTokenPassword parses conforming payload", async () => {
    const promise = lastValueFrom(service.verifyResetTokenPassword("reset-token"));

    httpMock.expectOne(`${BASE}/users/reset-password/reset-token/verify`).flush(true);

    expect(await promise).toBe(true);
  });
});
