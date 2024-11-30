import { inject, Injectable } from "@angular/core";
import { ProjectInfraService } from "./project-infra.service";
import { WsService } from "@tenzu/utils/services";
import { ProjectDetailStore, ProjectStore } from "@tenzu/data/project/project.store";
import { lastValueFrom } from "rxjs";
import { Workflow, WorkflowInfraService } from "@tenzu/data/workflow";
import { ProjectBase, ProjectCreation } from "@tenzu/data/project/project.model";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  projectInfraService = inject(ProjectInfraService);
  workflowInfraService = inject(WorkflowInfraService);
  projectStore = inject(ProjectStore);
  projectDetailStore = inject(ProjectDetailStore);
  wsService = inject(WsService);

  async deleteSelectedProject() {
    const project = this.projectDetailStore.item();
    if (project) {
      this.wsService.command({ command: "unsubscribe_from_project_events", project: project.id as string });
      await lastValueFrom(this.projectInfraService.delete(project.id));
      this.projectStore.removeEntity(project.id);
      this.projectDetailStore.reset();
      return project;
    }
    return undefined;
  }
  async createWorkflow(projectId: string, workflow: Pick<Workflow, "name">) {
    const newWorkflow = await lastValueFrom(this.workflowInfraService.create(projectId, workflow));
    this.projectDetailStore.addWorkflow(newWorkflow);
    return newWorkflow;
  }
  async getProject(projectId: string) {
    const oldSelectedEntityId = this.projectDetailStore.item()?.id as string;
    if (oldSelectedEntityId) {
      this.wsService.command({ command: "unsubscribe_from_project_events", project: oldSelectedEntityId });
    }
    const project = await lastValueFrom(this.projectInfraService.get(projectId));
    this.projectStore.addProject(project);
    this.projectDetailStore.set(project);
    this.wsService.command({ command: "subscribe_to_project_events", project: project.id });
    return project;
  }
  async patchSelectedProject(project: Partial<ProjectBase>) {
    const selectedEntity = this.projectDetailStore.item();
    if (selectedEntity) {
      const editedProject = await lastValueFrom(this.projectInfraService.patch(selectedEntity.id, project));
      this.projectStore.patchProject(editedProject);
      this.projectDetailStore.patch(editedProject);
    }
  }
  async createProject(project: ProjectCreation) {
    const newProject = await lastValueFrom(this.projectInfraService.create(project));
    this.projectStore.addProject(newProject);
    return newProject;
  }
}
