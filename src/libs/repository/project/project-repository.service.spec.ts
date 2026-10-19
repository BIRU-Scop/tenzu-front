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

import { beforeEach, describe, expect, it, Mocked } from "vitest";
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of } from "rxjs";

import { ProjectRepositoryService } from "./project-repository.service";
import { ProjectApiService } from "./project-api.service";
import { makeProjectDetail } from "./project.factories";
import { makeRole } from "../membership/membership.factories";
import { ProjectPermissions } from "../permission/permission.model";
import { ProjectMembershipRepositoryService } from "../project-membership/project-membership-repository.service";
import { ProjectRoleRepositoryService } from "../project-roles/project-role-repository.service";
import { StoryRepositoryService } from "../story/story-repository.service";
import { StoryTagRepositoryService } from "../story-tag/story-tag-repository.service";
import { WsService } from "@tenzu/utils/services/ws";
import { mockService } from "@tenzu/utils/testing/mocks";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe(ProjectRepositoryService.name, () => {
  let service: ProjectRepositoryService;
  let api: Mocked<ProjectApiService>;
  let storyTagRepository: Mocked<StoryTagRepositoryService>;

  beforeEach(() => {
    api = mockService(ProjectApiService);
    storyTagRepository = mockService(StoryTagRepositoryService);
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: ProjectApiService, useValue: api },
        { provide: WsService, useValue: mockService(WsService) },
        { provide: ProjectMembershipRepositoryService, useValue: mockService(ProjectMembershipRepositoryService) },
        { provide: ProjectRoleRepositoryService, useValue: mockService(ProjectRoleRepositoryService) },
        { provide: StoryRepositoryService, useValue: mockService(StoryRepositoryService) },
        { provide: StoryTagRepositoryService, useValue: storyTagRepository },
      ],
    });
    service = TestBed.inject(ProjectRepositoryService);

    api.get.mockReturnValue(
      of(
        makeProjectDetail({
          id: "project-1",
          userRole: makeRole({ permissions: [ProjectPermissions.VIEW_STORY] }),
        }),
      ),
    );
    const membershipRepository = TestBed.inject(
      ProjectMembershipRepositoryService,
    ) as Mocked<ProjectMembershipRepositoryService>;
    membershipRepository.listProjectMembershipRequest.mockResolvedValue(undefined);
    const roleRepository = TestBed.inject(ProjectRoleRepositoryService) as Mocked<ProjectRoleRepositoryService>;
    roleRepository.listRequest.mockResolvedValue([]);
  });

  describe("setup", () => {
    it("loads the tags once the project confirms the view_story permission", async () => {
      storyTagRepository.listRequest.mockResolvedValue([]);

      await expect(service.setup({ projectId: "project-1" })).resolves.toBeDefined();

      expect(storyTagRepository.listRequest).toHaveBeenCalledWith({ projectId: "project-1" });
    });

    it("does not request the tags when the role lacks view_story", async () => {
      api.get.mockReturnValue(of(makeProjectDetail({ id: "project-1", userRole: makeRole({ permissions: [] }) })));

      await expect(service.setup({ projectId: "project-1" })).resolves.toBeDefined();

      expect(storyTagRepository.listRequest).not.toHaveBeenCalled();
      expect(service.entityDetail()?.id).toBe("project-1");
    });

    it("loads the tags for a modify_project role without view_story", async () => {
      api.get.mockReturnValue(
        of(
          makeProjectDetail({
            id: "project-1",
            userRole: makeRole({ permissions: [ProjectPermissions.MODIFY_PROJECT] }),
          }),
        ),
      );
      storyTagRepository.listRequest.mockResolvedValue([]);

      await expect(service.setup({ projectId: "project-1" })).resolves.toBeDefined();

      expect(storyTagRepository.listRequest).toHaveBeenCalledWith({ projectId: "project-1" });
    });

    it("propagates http error when the permitted tags list fails", async () => {
      storyTagRepository.listRequest.mockRejectedValue(new HttpErrorResponse({ status: 500 }));

      await expect(service.setup({ projectId: "project-1" })).rejects.toBeInstanceOf(HttpErrorResponse);
    });
  });
});
