import { inject, Injectable } from "@angular/core";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { MembershipStore } from "@tenzu/data/membership";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectDetailStore, ProjectStore } from "@tenzu/data/project";
import { WorkflowStore } from "@tenzu/data/workflow";
import { WsService } from "@tenzu/utils/services";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "../../../libs/utils/functions/logging";
import { ProjectService } from "@tenzu/data/project/project.service";

@Injectable({
  providedIn: "root",
})
export class ProjectDetailService {
  workspaceStore = inject(WorkspaceStore);
  workflowStore = inject(WorkflowStore);
  membershipStore = inject(MembershipStore);
  projectDetailStore = inject(ProjectDetailStore);
  wsService = inject(WsService);
  projectService = inject(ProjectService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  loadProject(projectId: string) {
    this.projectService.getProject(projectId).then();
    this.membershipStore.listProjectMembership(projectId).then();
    this.membershipStore.listProjectInvitations(projectId).then();
  }
  loadWorkspace(workspaceId: string) {
    if (this.workspaceStore.selectedEntity()?.id !== workspaceId) {
      this.workspaceStore.get(workspaceId).then();
    }
  }
  load(workspaceId: string, projectId: string) {
    debug("project", "load start");
    try {
      const oldSelectedProjectId = this.projectDetailStore.item()?.id as string;
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
