/*
 * Copyright (C) 2025-2026 BIRU
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

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  input,
  runInInjectionContext,
  signal,
  viewChild,
} from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { StoryComment } from "@tenzu/repository/story-comment";
import { DatePipe } from "@angular/common";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { ButtonEditComponent } from "@tenzu/shared/components/ui/button/button-edit.component";
import { StoryDetail } from "@tenzu/repository/story";
import { StoryCommentFacade } from "../story-comment.facade";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { EditorComponent } from "@tenzu/shared/components/editor";
import { ReactiveFormsModule } from "@angular/forms";
import { UserStore } from "@tenzu/repository/user";
import { toObservable } from "@angular/core/rxjs-interop";
import { skip } from "rxjs";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-story-detail-comment-detail",
  imports: [
    TranslocoDirective,
    DatePipe,
    UserCardComponent,
    ButtonDeleteComponent,
    ConfirmDirective,
    ButtonEditComponent,
    ButtonCancelComponent,
    ButtonSaveComponent,
    EditorComponent,
    ReactiveFormsModule,
  ],
  host: { class: "flex flex-col gap-4 group" },
  template: `
    @let _comment = comment();
    @let _editionMode = editionMode();
    @let myUser = userStore.myUser();
    <ng-container *transloco="let t">
      <div class="flex flex-row justify-between">
        <app-user-card
          [fullName]="_comment.createdBy?.fullName || t('workflow.detail_story.former_user')"
          [avatarName]="_comment.createdBy?.fullName || ''"
          [color]="_comment.createdBy?.color || 0"
        />
        <span class="mat-label-medium text-on-surface-variant">
          {{ _comment.createdAt | date: "short" }}
          @if (_comment.deletedAt) {
            {{ t("workflow.detail_story.comments.deleted_at", { date: (_comment.deletedAt | date: "short") }) }}
          } @else if (_comment.modifiedAt) {
            {{ t("workflow.detail_story.comments.modified_at", { date: (_comment.modifiedAt | date: "short") }) }}
          }
        </span>
      </div>
      @if (_comment.deletedAt) {
        <span class="italic ms-10 text-on-surface-variant">{{
          t("workflow.detail_story.comments.deleted_comment")
        }}</span>
      } @else {
        <div class="flex flex-row justify-between w-full gap-2">
          <form class="flex flex-col gap-4 w-full" (submit)="$event.preventDefault()">
            <app-editor-block
              class="overflow-auto"
              [class.!border-0]="!_editionMode"
              [value]="_comment.text"
              [uploadFile]="undefined"
              [readonly]="!_editionMode"
              (validate)="save()"
              #commentEditorContainer
            />
            @if (_editionMode) {
              <div class="flex flex-row justify-end gap-2 py-4">
                <app-button-cancel (click)="cancelEdition()" />
                <app-button-save (click)="save()" />
              </div>
            }
          </form>
          @if (hasModifyPermission() && !_editionMode) {
            @if (myUser.id === _comment.createdBy?.id) {
              <div class="hidden group-hover:flex flex-row gap-2">
                <app-button-edit class="h-fit" [iconOnly]="true" (click)="onEdit()"></app-button-edit>
                <app-button-delete
                  class="h-fit"
                  [iconOnly]="true"
                  appConfirm
                  [data]="{
                    deleteAction: true,
                    message: t('workflow.detail_story.comments.confirm_remove_message_self'),
                  }"
                  (popupConfirm)="onDelete(_comment)"
                />
              </div>
            } @else if (hasModeratePermission()) {
              <div class="hidden group-hover:flex flex-row gap-2">
                <app-button-delete
                  class="h-fit"
                  [iconOnly]="true"
                  appConfirm
                  [data]="{
                    deleteAction: true,
                    message: t('workflow.detail_story.comments.confirm_remove_message_other'),
                  }"
                  (popupConfirm)="onDelete(_comment)"
                />
              </div>
            }
          }
        </div>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailCommentDetailComponent implements AfterViewChecked {
  injector = inject(Injector);
  storyCommentFacade = inject(StoryCommentFacade);
  userStore = inject(UserStore);

  comment = input.required<StoryComment>();
  storyDetail = input.required<StoryDetail>();
  hasModifyPermission = input(false);
  hasModeratePermission = input(false);
  editor = viewChild.required<EditorComponent>("commentEditorContainer");

  editionMode = signal(false);

  ngAfterViewChecked(): void {
    runInInjectionContext(this.injector, () => {
      toObservable(this.comment)
        .pipe(
          skip(1),
          filter((comment) => !comment.deletedAt),
        )
        .subscribe((comment) => {
          this.editor().jsonContent = comment.text;
        });
    });
  }

  onEdit() {
    this.editionMode.set(true);
    this.editor().enableAndFocus();
  }
  async onDelete(comment: StoryComment) {
    await this.storyCommentFacade.delete(comment, this.storyDetail());
  }

  cancelEdition() {
    this.editor().undo();
    this.editionMode.set(false);
  }

  async save() {
    await this.storyCommentFacade.update(this.editor(), this.comment());
    this.editionMode.set(false);
  }
}
