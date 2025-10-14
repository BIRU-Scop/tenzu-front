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

import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked, viewChild } from "@angular/core";
import { StoryDetail } from "@tenzu/repository/story";
import { ProjectDetail } from "@tenzu/repository/project";
import { StoryCommentRepositoryService } from "@tenzu/repository/story-comment";
import { TranslocoDirective } from "@jsverse/transloco";
import { EditorComponent } from "@tenzu/shared/components/editor";
import { MatInput } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormField } from "@angular/material/form-field";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";
import { StoryCommentComponent } from "./story-comment.component";

@Component({
  selector: "app-story-detail-comments",
  imports: [
    TranslocoDirective,
    EditorComponent,
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    CdkTextareaAutosize,
    ButtonSaveComponent,
    ButtonCancelComponent,
    StoryCommentComponent,
  ],
  template: `
    <div *transloco="let t" class="font-medium text-on-background flex flex-col gap-4">
      <p>{{ t("workflow.detail_story.comments.count", { totalComments: storyDetail().totalComments }) }}</p>
      <form class="flex flex-col gap-4" (submit)="save($event)">
        @if (createNewComment()) {
          <app-editor-block
            (focusout)="stopCreate(false)"
            class="overflow-auto"
            [uploadFile]="undefined"
            [focus]="true"
            #commentEditorContainer
          />
          <div class="flex flex-row justify-end gap-2 py-4">
            <app-button-cancel (click)="stopCreate(true)" />
            <app-button-save />
          </div>
        } @else {
          <mat-form-field class="mat-form-field">
            <textarea
              [cdkTextareaAutosize]="false"
              [cdkAutosizeMinRows]="1"
              [cdkAutosizeMaxRows]="1"
              [style.resize]="'none'"
              matInput
              type="text"
              [placeholder]="t('workflow.detail_story.comments.create_placeholder')"
              (focus)="startCreate()"
            ></textarea>
          </mat-form-field>
        }
      </form>
      @for (comment of storyCommentRepositoryService.entitiesSummary(); track comment.id) {
        <app-story-comment [comment]="comment" />
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailCommentsComponent {
  storyCommentRepositoryService = inject(StoryCommentRepositoryService);
  notificationService = inject(NotificationService);

  storyDetail = input.required<StoryDetail>();
  projectDetail = input.required<ProjectDetail>();
  editor = viewChild.required<EditorComponent>("commentEditorContainer");

  createNewComment = signal(false);

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
  startCreate() {
    this.createNewComment.set(true);
  }

  stopCreate(force = false) {
    if (force || this.editor().isEmpty()) {
      this.createNewComment.set(false);
    }
  }

  async save(event: SubmitEvent) {
    event.preventDefault();
    const data = { text: await this.editor().getHtmlContent() };
    await this.storyCommentRepositoryService.createRequest(data, {
      projectId: this.projectDetail().id,
      ref: this.storyDetail().ref,
    });
    this.notificationService.success({ title: "notification.action.changes_saved" });
    this.stopCreate(true);
  }
}
