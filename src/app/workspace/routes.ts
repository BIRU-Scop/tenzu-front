import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { inject } from "@angular/core";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { ProjectStore } from "@tenzu/data/project";
import { WorkflowStore } from "@tenzu/data/workflow/workflow.store";
import { MembershipStore } from "@tenzu/data/membership";

export async function workspaceResolver(route: ActivatedRouteSnapshot) {
  const workspaceStore = inject(WorkspaceStore);
  const membershipStore = inject(MembershipStore);
  await membershipStore.listWorkspaceMembership(route.paramMap.get("id")!);
  await membershipStore.listWorkspaceInvitations(route.paramMap.get("id")!);
  await membershipStore.listWorkspaceGuest(route.paramMap.get("id")!);
  return await workspaceStore.get(route.paramMap.get("id")!);
}

export async function projectByWorkspaceResolver(route: ActivatedRouteSnapshot) {
  const projectStore = inject(ProjectStore);
  const workflowStore = inject(WorkflowStore);
  const membershipStore = inject(MembershipStore);
  await projectStore
    .getProject(route.paramMap.get("projectId")!)
    .then((project) => workflowStore.setWorkflows(project.workflows));
  await membershipStore.listProjectMembership(route.paramMap.get("projectId")!);
  await membershipStore.listProjectInvitations(route.paramMap.get("projectId")!);
}

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./workspace-list/workspace-list.component").then((m) => m.WorkspaceListComponent),
    providers: [provideTranslocoScope("workspace")],
  },
  {
    path: "workspace/:id",
    loadComponent: () => import("./detail-base/detail-base.component").then((m) => m.DetailBaseComponent),
    providers: [provideTranslocoScope("workspace")],
    resolve: { workspace: workspaceResolver },
    children: [
      {
        path: "project/:projectId",
        loadComponent: () => import("./project-detail/project-detail.component").then((m) => m.ProjectDetailComponent),

        loadChildren: () => import("./project-detail/routes").then((m) => m.routes),
        providers: [provideTranslocoScope("workflow")],
        resolve: { project: projectByWorkspaceResolver },
      },
      {
        path: "",
        loadComponent: () =>
          import("./workspace-detail/workspace-detail.component").then((m) => m.WorkspaceDetailComponent),

        loadChildren: () => import("./workspace-detail/routes").then((m) => m.routes),
      },
    ],
  },
];
