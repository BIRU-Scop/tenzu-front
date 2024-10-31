/*
 * Copyright (C) 2024 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

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
