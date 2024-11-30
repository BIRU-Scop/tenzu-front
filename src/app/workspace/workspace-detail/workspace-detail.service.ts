import { inject, Injectable } from "@angular/core";
import { WorkspaceService, WorkspaceStore } from "@tenzu/data/workspace";
import { MembershipStore } from "@tenzu/data/membership";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ProjectStore } from "@tenzu/data/project";
import { lastValueFrom } from "rxjs";
import { debug } from "../../../libs/utils/functions/logging";

@Injectable({
  providedIn: "root",
})
export class WorkspaceDetailService {
  workspaceStore = inject(WorkspaceStore);
  membershipStore = inject(MembershipStore);
  projectStore = inject(ProjectStore);
  workspaceService = inject(WorkspaceService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  loadWorkspace(workspaceId: string) {
    try {
      this.workspaceStore.get(workspaceId).then();
      this.membershipStore.listWorkspaceMembership(workspaceId).then();
      this.membershipStore.listWorkspaceInvitations(workspaceId).then();
      this.membershipStore.listWorkspaceGuest(workspaceId).then();
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
        return this.router.navigate(["/404"]);
      }
      throw error;
    }
    return true;
  }
  loadProjects(workspaceId: string) {
    this.workspaceService.getProjects(workspaceId).subscribe((projects) => {
      this.projectStore.setProjects(projects);
    });
  }
  load(workspaceId: string) {
    debug("workspace", "load start");
    this.loadWorkspace(workspaceId);

    debug("workspace", "load end");
  }
}
