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

import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { ProjectImportationApiService } from "./project-importation-api.service";
import { CreateProjectImportationPayload, ProjectImportation, ProjectImportationNested } from "./importation.model";
import { WorkspaceSummary } from "../workspace/workspace.model";
import { WorkspaceRepositoryService } from "../workspace/workspace-repository.service";
import { ProjectImportationEntitiesStore } from "../importation/project-importation.store";
import { NotFoundEntityError } from "../base/errors";
import { InvitationsPayload } from "../membership/invitation.model";
import { map } from "rxjs/operators";
import { ProjectInvitationRepositoryService } from "../project-invitations/project-invitation-repository.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ProjectRepositoryService } from "../project/project-repository.service";
import { HOMEPAGE_URL } from "@tenzu/utils/functions/urls";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership/workspace-membership-repository.service";
import { UserStore } from "@tenzu/repository/user/user.store";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ProjectImportationRepositoryService {
  private importationsApiService = inject(ProjectImportationApiService);
  private projectImportationEntitiesStore = inject(ProjectImportationEntitiesStore);

  private projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  private workspaceRepositoryService = inject(WorkspaceRepositoryService);
  private workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  private projectRepositoryService = inject(ProjectRepositoryService);
  private userStore = inject(UserStore);

  private notificationService = inject(NotificationService);
  private router = inject(Router);

  entities = this.projectImportationEntitiesStore.entities;
  entityMap = this.projectImportationEntitiesStore.entityMap;

  addEntitySummary(params: { projectImportation: ProjectImportation; workspaceId: WorkspaceSummary["id"] }): void {
    try {
      this.workspaceRepositoryService.addUserImportedProjects(params);
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
    this.projectImportationEntitiesStore.addEntity(params.projectImportation);
  }

  async createRequest(item: CreateProjectImportationPayload, params: { workspaceId: WorkspaceSummary["id"] }) {
    const importation = await lastValueFrom(this.importationsApiService.create(item, params));

    this.addEntitySummary({ ...params, projectImportation: importation });
    return importation;
  }

  async listRequest(params: { workspaceId: WorkspaceSummary["id"] }) {
    const projectImportations = await lastValueFrom(this.importationsApiService.list(params));
    this.projectImportationEntitiesStore.setAllEntities(projectImportations);
    return projectImportations;
  }

  resetEntitySummaryList(): void {
    this.projectImportationEntitiesStore.reset();
  }
  updateEntitySummary(params: {
    projectImportation: ProjectImportation;
    workspaceId: WorkspaceSummary["id"];
  }): ProjectImportation {
    try {
      this.workspaceRepositoryService.updateUserImportedProjects(params);
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
    try {
      this.projectImportationEntitiesStore.updateEntity(params.projectImportation.id, params.projectImportation);
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
    return params.projectImportation;
  }

  deleteEntitySummary(params: {
    projectImportationId: ProjectImportation["id"];
    workspaceId: WorkspaceSummary["id"];
  }): void {
    try {
      this.workspaceRepositoryService.removeUserImportedProjects(params);
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
    try {
      return this.projectImportationEntitiesStore.deleteEntity(params.projectImportationId);
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
  }

  async deleteRequest(params: { projectImportationId: ProjectImportation["id"]; workspaceId: WorkspaceSummary["id"] }) {
    await lastValueFrom(this.importationsApiService.delete({ projectImportationId: params.projectImportationId }));
    this.deleteEntitySummary(params);
  }

  async handlePendingInvites(params: {
    projectImportation: ProjectImportationNested;
    workspaceId: WorkspaceSummary["id"];
    invitations: InvitationsPayload["invitations"];
  }) {
    const handlePendingInvitesResponse = await lastValueFrom(
      this.importationsApiService
        .handlePendingInvites(
          { invitations: params.invitations },
          { projectImportationId: params.projectImportation.id },
        )
        .pipe(
          map((invitedResult) => {
            const { project } = invitedResult.projectImportation;
            if (!project) {
              throw new Error("handlePendingInvites: projectImportation.project missing");
            }
            return {
              ...invitedResult,
              projectImportation: { ...invitedResult.projectImportation, project }, // make project required
              invitations: invitedResult.invitations.map((invitation) => ({
                ...invitation,
                project,
              })),
            };
          }),
        ),
    );
    this.projectInvitationRepositoryService.upsertMultipleEntitiesSummary(handlePendingInvitesResponse.invitations);

    this.deleteEntitySummary({
      projectImportationId: handlePendingInvitesResponse.projectImportation.id,
      workspaceId: params.workspaceId,
    });

    // update projects
    if (this.router.url === HOMEPAGE_URL) {
      await this.workspaceRepositoryService.listRequest();
      return;
    } else {
      this.projectRepositoryService.addEntitySummary({
        userIsInvited: false,
        ...handlePendingInvitesResponse.projectImportation.project,
      });

      const currentProject = this.projectRepositoryService.entityDetail();
      if (currentProject && currentProject.id === handlePendingInvitesResponse.projectImportation.project.id) {
        this.projectRepositoryService.updateEntityDetail({
          ...currentProject,
          importation: handlePendingInvitesResponse.projectImportation,
        });
      }

      const currentWorkspace = this.workspaceRepositoryService.entityDetail();
      if (currentWorkspace && currentWorkspace.id === params.workspaceId) {
        this.workspaceRepositoryService.updateEntityDetail({
          ...currentWorkspace,
          totalProjects: currentWorkspace.totalProjects + 1,
        });
        this.workspaceMembershipRepositoryService.addToProjectCount({
          userId: this.userStore.myUser().id,
          workspaceId: params.workspaceId,
        });
      }
    }

    this.notificationService.success({
      title: "notification.events.importation_success",
      translocoTitleParams: {
        fileName: handlePendingInvitesResponse.projectImportation.sourceName,
      },
    });
  }
}
