import { ProjectSummary } from "@tenzu/data/project";
import { Workflow } from "@tenzu/data/workflow";
import { WorkspaceProject } from "@tenzu/data/workspace";

export type UrlableProject = ProjectSummary | WorkspaceProject;

export function getProjectRootListUrl(project: UrlableProject) {
  return ["workspace", project.workspaceId, "project", project.id];
}

export function getProjectRootUrl(project: UrlableProject) {
  return `/${getProjectRootListUrl(project).join("/")}`;
}

export function getProjectLandingPageUrl(project: UrlableProject) {
  return `${getProjectRootUrl(project)}/${project.landingPage}`;
}

export function getWorkflowUrl(project: UrlableProject, slug: Workflow["slug"]) {
  return `${getProjectRootUrl(project)}/kanban/${slug}`;
}
