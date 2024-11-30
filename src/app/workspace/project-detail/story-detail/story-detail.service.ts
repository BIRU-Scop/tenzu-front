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
import { ProjectDetailStore, ProjectStore } from "@tenzu/data/project";
import { StoryDetail, StoryService, StoryStore, StoryUpdate } from "@tenzu/data/story";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { Router } from "@angular/router";
import { WorkflowStore } from "@tenzu/data/workflow";

@Injectable({
  providedIn: "root",
})
export class StoryDetailService {
  workflowStore = inject(WorkflowStore);
  projectStore = inject(ProjectStore);
  projectDetailStore = inject(ProjectDetailStore);
  workspaceStore = inject(WorkspaceStore);
  storyStore = inject(StoryStore);
  storyService = inject(StoryService);
  router = inject(Router);

  public async patchSelectedStory(data: Partial<StoryUpdate>) {
    const project = this.projectDetailStore.item();
    const story = this.storyStore.selectedStoryDetails();
    if (project && story) {
      return this.storyStore.patch(project.id, story, {
        ...data,
        version: story.version,
        ref: story.ref,
      });
    }
    throw new Error("No story to update");
  }

  public async deleteSelectedStory() {
    const project = this.projectDetailStore.item();
    const story = this.storyStore.selectedStoryDetails();
    if (project && story) {
      const workflow = this.workflowStore.entityMap()[story.workflowId];
      await this.storyStore.deleteStory(project!.id, story!.ref);
      await this.router.navigateByUrl(
        `/workspace/${project?.workspaceId}/project/${project.id}/kanban/${workflow!.slug}`,
      );
    }
  }

  public async addAttachment(file: File) {
    const project = this.projectDetailStore.item();
    if (project) {
      await this.storyStore.createAttachment(project.id, this.storyStore.selectedStoryDetails().ref, file);
    }
  }

  public async deleteAttachment(id: string) {
    const project = this.projectDetailStore.item();
    if (project) {
      await this.storyStore.deleteAttachment(project!.id, this.storyStore.selectedStoryDetails().ref, id);
    }
  }

  public getStoryAttachmentUrlBack(attachmentId: string) {
    const project = this.projectDetailStore.item();
    if (project) {
      return this.storyService.getStoryAttachmentUrl(
        project.id,
        this.storyStore.selectedStoryDetails().ref,
        attachmentId,
      );
    } else {
      return "";
    }
  }
}
