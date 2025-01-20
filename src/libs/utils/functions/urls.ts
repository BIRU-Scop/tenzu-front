import { Workspace } from "@tenzu/data/workspace";
import { Project } from "@tenzu/data/project";
import { Workflow } from "@tenzu/data/workflow";

export function getWorkflowUrl(workspaceId: Workspace["id"], projectId: Project["id"], slug: Workflow["slug"]) {
  return `/workspace/${workspaceId}/project/${projectId}/kanban/${slug}`;
}
