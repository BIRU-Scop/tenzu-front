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

import { ChangeDetectionStrategy, Component, inject, input, signal, viewChild } from "@angular/core";
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
import { MatDivider } from "@angular/material/divider";
import { StoryCommentFacade } from "./story-comment.facade";
import { EventOnVisibleDirective } from "@tenzu/directives/event-on-visible.directive";
import { StoryCommentSkeletonComponent } from "./story-comment-skeleton.component";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";

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
    MatDivider,
    EventOnVisibleDirective,
    StoryCommentSkeletonComponent,
  ],
  template: `
    <div *transloco="let t" class="font-medium text-on-background flex flex-col gap-4">
      <p>{{ t("workflow.detail_story.comments.count", { totalComments: storyDetail().totalComments }) }}</p>
      <form class="flex flex-col gap-4" (submit)="$event.preventDefault()">
        @if (createNewComment()) {
          <app-editor-block
            (focusout)="stopCreate(false)"
            class="overflow-auto"
            [uploadFile]="undefined"
            [focus]="true"
            #commentNewEditorContainer
          />
          <div class="flex flex-row justify-end gap-2 py-4">
            <app-button-cancel (click)="stopCreate(true)" />
            <app-button-save (click)="create()" />
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
      @for (comment of storyCommentRepositoryService.entitiesSummary(); track comment.id; let last = $last) {
        @if (last) {
          <app-story-comment
            [@newCommentFlyIn]="storyCommentRepositoryService.entitiesSummary().length || 0"
            [comment]="comment"
            [storyDetail]="storyDetail()"
            appEventOnVisible
            [debounceTime]="200"
            [threshold]="0.3"
            (visible)="loadMoreComments()"
          />
        } @else {
          <app-story-comment [comment]="comment" [storyDetail]="storyDetail()" />
          <mat-divider></mat-divider>
        }
      }
      @if (storyCommentRepositoryService.isLoading()) {
        <app-story-comment-skeleton class="mb-4 cursor-progress"></app-story-comment-skeleton>
      }
    </div>
  `,
  styles: ``,
  animations: [
    trigger("newCommentFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(0, [animate("200ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailCommentsComponent {
  storyCommentFacade = inject(StoryCommentFacade);
  storyCommentRepositoryService = inject(StoryCommentRepositoryService);
  notificationService = inject(NotificationService);

  storyDetail = input.required<StoryDetail>();
  projectDetail = input.required<ProjectDetail>();
  editor = viewChild.required<EditorComponent>("commentNewEditorContainer");

  createNewComment = signal(false);

  startCreate() {
    this.createNewComment.set(true);
  }

  stopCreate(force = false) {
    if (force || this.editor().isEmpty()) {
      this.createNewComment.set(false);
    }
  }

  async create() {
    await this.storyCommentFacade.create(this.editor(), this.projectDetail(), this.storyDetail());
    this.stopCreate(true);
  }

  loadMoreComments() {
    this.storyCommentRepositoryService.listRequest({
      projectId: this.projectDetail().id,
      ref: this.storyDetail().ref,
    });
  }
}
