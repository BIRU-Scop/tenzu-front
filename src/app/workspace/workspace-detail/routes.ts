import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { inject } from "@angular/core";

import { ProjectStore } from "@tenzu/data/project";

export async function projectByWorkspaceResolver(route: ActivatedRouteSnapshot) {
  const projectStore = inject(ProjectStore);
  return await projectStore.getProjectsByWorkspaceId(route.paramMap.get("id")!);
}

export const routes: Routes = [
  {
    path: "",
    redirectTo: "projects",
    pathMatch: "prefix",
  },
  {
    path: "projects",
    loadComponent: () =>
      import("./workspace-project-list/workspace-project-list.component").then((m) => m.WorkspaceProjectListComponent),
    resolve: {
      projects: projectByWorkspaceResolver,
    },
  },
  {
    path: "people",
    loadComponent: () =>
      import("./workspace-people/workspace-people.component").then((m) => m.WorkspacePeopleComponent),
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./workspace-settings/workspace-settings.component").then((m) => m.WorkspaceSettingsComponent),
  },
];
