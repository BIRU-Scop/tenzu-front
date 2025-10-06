/*
 * Copyright (C) 2025 BIRU
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

import { ChangeDetectionStrategy, Component, effect, inject, input, untracked, viewChild } from "@angular/core";
import { StoryDetail } from "@tenzu/repository/story";
import { ProjectDetail } from "@tenzu/repository/project";
import { StoryCommentRepositoryService } from "@tenzu/repository/story-comment";
import { TranslocoDirective } from "@jsverse/transloco";
import { EditorComponent } from "@tenzu/shared/components/editor";

@Component({
  selector: "app-story-detail-comments",
  imports: [TranslocoDirective, EditorComponent],
  template: `
    <!--    @let comments = storyCommentRepositoryService.entitiesSummary();-->
    <div *transloco="let t" class="font-medium text-on-background flex flex-col gap-4">
      <p>{{ t("workflow.detail_story.comments.count", { totalComments: storyDetail().totalComments }) }}</p>
      <app-editor-block class="overflow-auto editor h-12" [uploadFile]="undefined" #commentEditorContainer />
    </div>
  `,
  styles: `
    .editor {
      padding: 1em;
      border-style: solid;
      border-radius: 0.25rem;
      border-color: var(--mat-sys-outline);
      border-width: 1px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailCommentsComponent {
  storyCommentRepositoryService = inject(StoryCommentRepositoryService);

  storyDetail = input.required<StoryDetail>();
  projectDetail = input.required<ProjectDetail>();
  editor = viewChild.required<EditorComponent>("commentEditorContainer");
  constructor() {
    effect(() => {
      this.storyCommentRepositoryService.resetAll();
      untracked(() =>
        this.storyCommentRepositoryService
          .listRequest({
            projectId: this.storyDetail().projectId,
            ref: this.storyDetail().ref,
          })
          .then(),
      ).then();
    });
  }
}
