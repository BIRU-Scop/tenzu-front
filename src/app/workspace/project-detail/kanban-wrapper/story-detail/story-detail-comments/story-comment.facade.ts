/*
 * Copyright (C) 2024-2025 BIRU
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
import { ProjectDetail } from "@tenzu/repository/project";
import { StoryDetail } from "@tenzu/repository/story";
import { Router } from "@angular/router";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";
import { StoryComment, StoryCommentRepositoryService } from "@tenzu/repository/story-comment";
import { EditorComponent } from "@tenzu/shared/components/editor";
import { NotificationService } from "@tenzu/utils/services/notification";

@Injectable({
  providedIn: "root",
})
export class StoryCommentFacade {
  storyRepositoryService = inject(StoryRepositoryService);
  storyCommentRepositoryService = inject(StoryCommentRepositoryService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  async create(editor: EditorComponent, project: ProjectDetail, story: StoryDetail) {
    const data = { text: editor.jsonContent };
    await this.storyCommentRepositoryService.createRequest(
      data,
      {
        projectId: project.id,
        ref: story.ref,
      },
      { prepend: true },
    );
    this.storyRepositoryService.updateCommentsCount(story.ref, 1);
    this.notificationService.success({ title: "notification.action.changes_saved" });
  }

  async delete(comment: StoryComment, story: StoryDetail) {
    await this.storyCommentRepositoryService.deleteRequest(comment, { commentId: comment.id });
    this.storyRepositoryService.updateCommentsCount(story.ref, -1);
  }

  async update(editor: EditorComponent, comment: StoryComment) {
    const data = { text: editor.jsonContent };
    await this.storyCommentRepositoryService.patchRequest(comment.id, data, {
      commentId: comment.id,
    });
    this.notificationService.success({ title: "notification.action.changes_saved" });
  }
}
