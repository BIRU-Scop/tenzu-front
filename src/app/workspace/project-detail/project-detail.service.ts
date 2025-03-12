/*
 * Copyright (C) 2024-2025 BIRU
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
import { MembershipService } from "@tenzu/data/membership";
import { ActivatedRoute, Router } from "@angular/router";
import { WsService } from "@tenzu/utils/services/ws";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";
import { ProjectService } from "@tenzu/data/project/project.service";
import { WorkspaceService } from "@tenzu/data/workspace/workspace.service";

@Injectable({
  providedIn: "root",
})
export class ProjectDetailService {
  workspaceService = inject(WorkspaceService);
  membershipService = inject(MembershipService);
  wsService = inject(WsService);
  projectService = inject(ProjectService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  loadProject(projectId: string) {
    this.projectService.get(projectId).then();
    this.membershipService.listProjectMembership(projectId).then();
    this.membershipService.listProjectInvitations(projectId).then();
  }

  loadWorkspace(workspaceId: string) {
    if (this.workspaceService.selectedEntity()?.id !== workspaceId) {
      this.workspaceService.get(workspaceId).then();
    }
  }

  load(workspaceId: string, projectId: string) {
    debug("project", "load start");
    try {
      const oldSelectedProjectId = this.projectService.selectedEntity()?.id as string;
      if (oldSelectedProjectId) {
        this.wsService.command({ command: "unsubscribe_from_project_events", project: oldSelectedProjectId });
      }
      this.loadProject(projectId);
      this.loadWorkspace(workspaceId);

      debug("project", "after  ");
      this.wsService.command({ command: "subscribe_to_project_events", project: projectId });
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
        this.router.navigate(["/404"]).then();
      }
      throw error;
    }
    debug("project", "load end");
  }
}
