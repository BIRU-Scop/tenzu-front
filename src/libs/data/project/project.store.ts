import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { addEntity, removeEntity, setAllEntities, setEntity, withEntities } from "@ngrx/signals/entities";
import { Project, ProjectBase } from "./project.model";
import { inject } from "@angular/core";
import { WorkspaceService } from "@tenzu/data/workspace";
import { lastValueFrom } from "rxjs";
import {
  setLoadingBegin,
  setLoadingEnd,
  setSelectedEntity,
  withLoadingStatus,
  withSelectedEntity,
} from "../../utils/store/store-features";
import { ProjectService } from "@tenzu/data/project/project.service";
import { Workflow, WorkflowService } from "@tenzu/data/workflow";

export const ProjectStore = signalStore(
  { providedIn: "root" },
  withEntities<Project>(),
  withLoadingStatus(),
  withSelectedEntity(),
  withMethods(
    (
      store,
      workspaceService = inject(WorkspaceService),
      projectService = inject(ProjectService),
      workflowService = inject(WorkflowService),
    ) => ({
      addProject(project: Project) {
        patchState(store, addEntity(project));
      },
      async createWorkflow(projectId: string, workflow: Pick<Workflow, "name">) {
        await lastValueFrom(workflowService.create(projectId, workflow));
      },
      async getProjectsByWorkspaceId(workspaceId: string) {
        patchState(store, setLoadingBegin());
        const projects = await lastValueFrom(workspaceService.getProjects(workspaceId));
        patchState(store, setLoadingEnd());
        patchState(store, setAllEntities(projects));
        return projects;
      },
      async getProject(projectId: string) {
        patchState(store, setLoadingBegin());
        const project = await lastValueFrom(projectService.get(projectId));
        patchState(store, setLoadingEnd());
        patchState(store, setEntity(project));
        patchState(store, setSelectedEntity(projectId));
        return project;
      },
      async patchSelectedEntity(project: Partial<ProjectBase>) {
        const selectedEntity = store.selectedEntity();
        if (selectedEntity) {
          const editedProject = await lastValueFrom(projectService.patch(selectedEntity.id, project));
          patchState(store, setEntity(editedProject));
        }
      },
      async deleteSelectedEntity() {
        const selectedEntityId = store.selectedEntityId();
        const selectedEntity = store.selectedEntity();
        if (selectedEntityId && selectedEntity) {
          await lastValueFrom(projectService.delete(selectedEntity.id));
          patchState(store, removeEntity(selectedEntityId));
          return selectedEntity;
        }
        throw Error(`No entity to delete`);
      },
    }),
  ),
);
