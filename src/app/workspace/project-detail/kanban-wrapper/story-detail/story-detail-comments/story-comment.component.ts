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

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { StoryComment, StoryCommentRepositoryService } from "@tenzu/repository/story-comment";
import { SafeHtmlPipe } from "@tenzu/pipes/safe-html.pipe";
import { DatePipe } from "@angular/common";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { ButtonEditComponent } from "@tenzu/shared/components/ui/button/button-edit.component";

@Component({
  selector: "app-story-comment",
  imports: [
    TranslocoDirective,
    SafeHtmlPipe,
    DatePipe,
    UserCardComponent,
    ButtonDeleteComponent,
    ConfirmDirective,
    ButtonEditComponent,
  ],
  template: `
    @let _comment = comment();
    <div *transloco="let t" class="flex flex-col gap-4">
      <div class="flex flex-row justify-between">
        <app-user-card
          [fullName]="_comment.createdBy?.fullName || t('workflow.detail_story.former_user')"
          [avatarName]="_comment.createdBy?.fullName || ''"
          [color]="_comment.createdBy?.color || 0"
        />
        <span class="mat-label-medium text-on-surface-variant">
          {{ _comment.createdAt | date: "short" }}
          @if (_comment.modifiedAt) {
            {{ t("workflow.detail_story.comments.modified_at", { date: (_comment.modifiedAt | date: "short") }) }}
          }
        </span>
      </div>
      @if (_comment.deletedBy) {
        <span class="italic ms-10 text-on-surface-variant">{{
          t("workflow.detail_story.comments.deleted_comment")
        }}</span>
      } @else {
        <div class="flex flex-row justify-between group w-full">
          <div
            class="ms-10 min-w-0 grow-0 text-wrap break-words whitespace-pre-wrap"
            [innerHTML]="_comment.text | safeHtml"
          ></div>
          <div class="hidden group-hover:flex flex-row gap-2">
            <app-button-edit [iconOnly]="true"></app-button-edit>
            <app-button-delete
              [iconOnly]="true"
              appConfirm
              [data]="{
                deleteAction: true,
              }"
              (popupConfirm)="onDelete(_comment)"
            ></app-button-delete>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCommentComponent {
  storyCommentRepositoryService = inject(StoryCommentRepositoryService);

  comment = input.required<StoryComment>();

  async onDelete(comment: StoryComment) {
    await this.storyCommentRepositoryService.deleteRequest(comment, { commentId: comment.id });
    // TODO instead of removing object from store, update it to put it in deleted state
  }
}
