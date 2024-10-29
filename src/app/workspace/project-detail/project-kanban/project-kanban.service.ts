import { inject, Injectable } from "@angular/core";
import { WorkflowStore } from "@tenzu/data/workflow";
import { StoryStore } from "@tenzu/data/story";
import { ProjectStore } from "@tenzu/data/project";
import { Status } from "@tenzu/data/status";
import { StoryCreate } from "@tenzu/data/story";

/**
 * This service create a modal positioned relatively to its trigger button
 */
@Injectable({
  providedIn: "root",
})
export class ProjectKanbanService {
  projectStore = inject(ProjectStore);
  workflowStore = inject(WorkflowStore);
  storyStore = inject(StoryStore);

  public async createStatus(status: Pick<Status, "name" | "color">) {
    const selectedProject = this.projectStore.selectedEntity();
    if (selectedProject) {
      await this.workflowStore.createStatus(selectedProject.id, status);
    }
  }

  public async deleteStatus(statusId: string, moveToStatus?: string) {
    const selectedProject = this.projectStore.selectedEntity();
    if (selectedProject) {
      await this.workflowStore.deleteStatus(selectedProject.id, statusId, moveToStatus);
      const newStatus = this.workflowStore.selectedEntity()?.statuses.find((status) => status.id === moveToStatus);
      if (newStatus) {
        this.storyStore.deleteStatusGroup(statusId, newStatus);
      }
    }
  }

  public async editStatus(status: Pick<Status, "name" | "id">) {
    const selectedProject = this.projectStore.selectedEntity();
    if (selectedProject) {
      await this.workflowStore.editStatus(selectedProject.id, status);
    }
  }

  public async createStory(story: StoryCreate) {
    const selectedProject = this.projectStore.selectedEntity();
    const selectedWorkflow = this.workflowStore.selectedEntity();
    if (selectedProject && selectedWorkflow) {
      await this.storyStore.create(selectedProject.id, selectedWorkflow.slug, story);
    }
  }

  async assignStory(username: string, projectId: string | null = null, storyRef: number | null = null) {
    const pId = projectId ? projectId : this.projectStore.selectedEntity()?.id;
    const ref = storyRef ? storyRef : this.storyStore.selectedStoryDetails().ref;
    if (pId) {
      await this.storyStore.createAssign(pId, ref, username);
    }
  }

  async removeAssignStory(username: string, projectId: string | null = null, storyRef: number | null = null) {
    const pId = projectId ? projectId : this.projectStore.selectedEntity()?.id;
    const ref = storyRef ? storyRef : this.storyStore.selectedStoryDetails().ref;
    if (pId) {
      await this.storyStore.deleteAssign(pId, ref, username);
    }
  }
}
