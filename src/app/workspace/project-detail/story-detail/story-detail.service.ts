import { inject, Injectable } from "@angular/core";
import { ProjectStore } from "@tenzu/data/project";
import { StoryDetail, StoryService, StoryStore } from "@tenzu/data/story";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { Router } from "@angular/router";
import { WorkflowStore } from "@tenzu/data/workflow";

@Injectable({
  providedIn: "root",
})
export class StoryDetailService {
  workflowStore = inject(WorkflowStore);
  projectStore = inject(ProjectStore);
  workspaceStore = inject(WorkspaceStore);
  storyStore = inject(StoryStore);
  storyService = inject(StoryService);
  router = inject(Router);

  public async patchSelectedStory(data: Partial<StoryDetail>) {
    const project = this.projectStore.selectedEntity();
    const story = this.storyStore.selectedStoryDetails();
    if (project && story) {
      await this.storyStore.patch(project.id, story, data);
      return true;
    }
    return false;
  }

  public async deleteSelectedStory() {
    const project = this.projectStore.selectedEntity();
    const story = this.storyStore.selectedStoryDetails();
    const workflow = this.workflowStore.selectedEntity();
    const workspace = this.workspaceStore.selectedEntity();
    await this.storyStore.deleteStory(project!.id, story!.ref);
    await this.router.navigateByUrl(`/workspace/${workspace!.id}/project/${project!.id}/kanban/${workflow!.slug}`);
  }

  public async addAttachment(file: File) {
    await this.storyStore.addAttachment(
      this.projectStore.selectedEntity()!.id,
      this.storyStore.selectedStoryDetails().ref,
      file,
    );
  }

  public async deleteAttachment(id: string) {
    await this.storyStore.deleteAttachment(
      this.projectStore.selectedEntity()!.id,
      this.storyStore.selectedStoryDetails().ref,
      id,
    );
  }

  public getStoryAttachmentUrlBack(attachmentId: string) {
    return this.storyService.getStoryAttachmentUrl(
      this.projectStore.selectedEntity()!.id,
      this.storyStore.selectedStoryDetails().ref,
      attachmentId,
    );
  }
}
