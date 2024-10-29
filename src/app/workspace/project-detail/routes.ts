import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { inject } from "@angular/core";
import { StoryStore } from "@tenzu/data/story";
import { provideTranslocoScope } from "@jsverse/transloco";
import { WorkflowStore } from "@tenzu/data/workflow";

export async function storyResolver(route: ActivatedRouteSnapshot) {
  const storyStore = inject(StoryStore);
  const workflowStore = inject(WorkflowStore);
  const story = await storyStore.get(route.paramMap.get("projectId")!, parseInt(route.paramMap.get("ref")!, 10));

  if (!workflowStore.entityMap()[story.workflowId]?.statuses) {
    const workflow = await workflowStore.refreshWorkflowById(route.paramMap.get("projectId")!, story.workflowId);
    workflowStore.selectWorkflow(workflow.id);
  }
}
export async function workflowResolver(route: ActivatedRouteSnapshot) {
  const workflowStore = inject(WorkflowStore);
  const projectId = route.paramMap.get("projectId")!;
  const workflowSLug = route.paramMap.get("workflowSlug")!;

  await workflowStore
    .refreshWorkflow({ projectId: projectId, slug: workflowSLug })
    .then((workflow) => workflowStore.selectWorkflow(workflow.id));
}

export const routes: Routes = [
  {
    path: "",
    redirectTo: "kanban/main",
    pathMatch: "prefix",
  },
  {
    path: "kanban/:workflowSlug",
    loadComponent: () => import("./project-kanban/project-kanban.component").then((m) => m.ProjectKanbanComponent),
    providers: [provideTranslocoScope("workflow")],
    resolve: { workflow: workflowResolver },
  },
  {
    path: "story/:ref",
    loadComponent: () => import("./story-detail/story-detail.component").then((m) => m.StoryDetailComponent),
    providers: [provideTranslocoScope("workflow")],
    resolve: { story: storyResolver },
  },
  {
    path: "new-workflow",
    loadComponent: () =>
      import("./project-kanban-create/project-kanban-create.component").then((m) => m.ProjectKanbanCreateComponent),
    providers: [provideTranslocoScope("workflow")],
  },
  {
    path: "members",
    loadComponent: () => import("./project-members/project-members.component").then((m) => m.ProjectMembersComponent),
    providers: [provideTranslocoScope("project")],
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./project-settings/project-settings.component").then((m) => m.ProjectSettingsComponent),
    providers: [provideTranslocoScope("project")],
  },
];
