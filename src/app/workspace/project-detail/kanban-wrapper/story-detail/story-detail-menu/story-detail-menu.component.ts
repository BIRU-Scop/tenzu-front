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

import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { MatIconAnchor, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { StoryDetail } from "@tenzu/repository/story";
import { Router, RouterLink } from "@angular/router";
import { ChooseWorkflowDialogComponent } from "../choose-workflow-dialog/choose-workflow-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { StoryDetailFacade } from "../story-detail.facade";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { MatFormField } from "@angular/material/form-field";
import { MatOption, MatSelect, MatSelectTrigger } from "@angular/material/select";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { StoryView } from "../../kanban-wrapper.store";
import { KanbanWrapperService } from "../../kanban-wrapper.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-story-detail-menu",
  standalone: true,
  imports: [
    TranslocoDirective,
    MatIcon,
    MatIconAnchor,
    MatIconButton,
    MatTooltip,
    RouterLink,
    MatFormField,
    MatSelect,
    MatSelectTrigger,
    ReactiveFormsModule,
    MatOption,
  ],
  template: `
    @let _story = story();
    @if (_story) {
      <div class="flex flex-row p-4 justify-between">
        <div class="flex flex-row gap-1  place-items-center" *transloco="let t; prefix: 'workflow.detail_story'">
          <span class="text-on-surface-variant mat-title-small">{{ t("workflow") }}</span>
          <span class="text-on-surface mat-title-medium">{{ _story.workflow.name }}</span>
          @if (hasModifyPermission()) {
            <button
              mat-icon-button
              class="icon-sm"
              type="button"
              [attr.aria-label]="t('change_workflow')"
              (click)="openChooseWorkflowDialog($event)"
              [matTooltip]="t('change_workflow')"
            >
              <mat-icon>edit</mat-icon>
            </button>
          }
          <span class="text-on-surface-variant mat-title-small">/</span>
          <span class="text-on-surface-variant mat-title-small">{{ t("story") }}</span>
          <span class="text-on-surface mat-title-medium">#{{ _story.ref }}</span>
          <a
            mat-icon-button
            class="icon-sm"
            type="button"
            [attr.aria-label]="t('story_previous')"
            [matTooltip]="t('story_previous')"
            [disabled]="!_story.prev"
            [routerLink]="[
              '/workspace',
              workspaceService.entityDetail()?.id,
              'project',
              _story.projectId,
              'story',
              _story.prev?.ref,
            ]"
          >
            <mat-icon>arrow_back</mat-icon>
          </a>
          <a
            mat-icon-button
            class="icon-sm"
            type="button"
            [attr.aria-label]="t('story_next')"
            [matTooltip]="t('story_next')"
            [disabled]="!_story.next"
            [routerLink]="[
              '/workspace',
              workspaceService.entityDetail()?.id,
              'project',
              _story.projectId,
              'story',
              _story.next?.ref,
            ]"
          >
            <mat-icon>arrow_forward</mat-icon>
          </a>
          <mat-form-field class="transparent self-end">
            <mat-select [formControl]="storyView">
              <mat-select-trigger>
                <mat-icon>{{ typeStoryView[storyView.getRawValue()] }}</mat-icon>
              </mat-select-trigger>
              <mat-option [value]="'kanban'">
                <mat-icon>capture</mat-icon>
              </mat-option>
              <mat-option [value]="'fullView'">
                <mat-icon>fullscreen</mat-icon>
              </mat-option>
              <mat-option [value]="'side-view'">
                <mat-icon>view_sidebar</mat-icon>
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        @if (canBeClosed()) {
          <button mat-icon-button (click)="closed.emit()">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailMenuComponent {
  typeStoryView = { kanban: "capture", fullView: "fullscreen", "side-view": "view_sidebar" };

  relativeDialog = inject(RelativeDialogService);
  notificationService = inject(NotificationService);
  storyDetailService = inject(StoryDetailFacade);
  workspaceService = inject(WorkspaceRepositoryService);
  router = inject(Router);
  kanbanWrapperService = inject(KanbanWrapperService);
  dialogRef = inject(MatDialog);

  storyView = new FormControl<StoryView>("kanban", { nonNullable: true });

  canBeClosed = input(false);
  hasModifyPermission = input(false);
  story = input.required<StoryDetail>();

  closed = output<void>();

  constructor() {
    toObservable(this.kanbanWrapperService.storyView).subscribe((storyView) => {
      this.storyView.setValue(storyView);
      if (storyView !== "kanban") {
        this.dialogRef.closeAll();
      }
    });
    this.storyView.valueChanges.subscribe((storyView) => {
      this.kanbanWrapperService.setStoryView(storyView);
    });
  }
  openChooseWorkflowDialog(event: MouseEvent): void {
    const story = this.story();
    const dialogRef = this.relativeDialog.open(ChooseWorkflowDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "right",
      data: {
        currentWorkflowId: story?.workflow.id,
      },
    });
    dialogRef.afterClosed().subscribe(async (newWorkflowId: string) => {
      if (newWorkflowId && newWorkflowId !== story?.workflow.id) {
        const patchedStory = await this.storyDetailService.changeWorkflowSelectedStory({
          workflowId: newWorkflowId,
        });
        if (patchedStory) {
          this.notificationService.success({ title: "notification.action.changes_saved" });
        }
      }
    });
  }
}
