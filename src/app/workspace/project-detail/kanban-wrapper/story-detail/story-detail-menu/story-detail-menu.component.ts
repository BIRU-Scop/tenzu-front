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
import { StoryDetail } from "@tenzu/data/story";
import { Router, RouterLink } from "@angular/router";
import { ChooseWorkflowDialogComponent } from "../choose-workflow-dialog/choose-workflow-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { StoryDetailService } from "../story-detail.service";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { WorkspaceService } from "@tenzu/data/workspace";
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
    @let story = inputStory();
    <div class="flex gap-1 items-baseline mb-2" *transloco="let t; prefix: 'workflow.detail_story'">
      <span class="text-on-surface-variant mat-title-small">{{ t("workflow") }}</span>
      <span class="text-on-surface mat-title-medium">{{ story?.workflow?.name }}</span>
      <button
        class="icon-sm"
        mat-icon-button
        type="button"
        [attr.aria-label]="t('change_workflow')"
        (click)="openChooseWorkflowDialog($event)"
        [matTooltip]="t('change_workflow')"
      >
        <mat-icon>edit</mat-icon>
      </button>
      <span class="text-on-surface-variant mat-title-small">/</span>
      <span class="text-on-surface-variant mat-title-small">{{ t("story") }}</span>
      <span class="text-on-surface mat-title-medium">#{{ story.ref }}</span>
      <a
        mat-icon-button
        class="icon-sm"
        type="button"
        [attr.aria-label]="t('story_previous')"
        [matTooltip]="t('story_previous')"
        [disabled]="!story.prev"
        [routerLink]="[
          '/workspace',
          workspaceService.selectedEntity()?.id,
          'project',
          story.projectId,
          'story',
          story.prev?.ref,
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
        [disabled]="!story.next"
        [routerLink]="[
          '/workspace',
          workspaceService.selectedEntity()?.id,
          'project',
          story.projectId,
          'story',
          story.next?.ref,
        ]"
      >
        <mat-icon>arrow_forward</mat-icon>
      </a>
      <mat-form-field class="transparent self-end">
        <mat-select [formControl]="storyView">
          <mat-select-trigger>
            <mat-icon>{{ typeStoryView[storyView.getRawValue()] }}</mat-icon>
          </mat-select-trigger>
          <mat-option [value]="'kanban'"><mat-icon>capture</mat-icon></mat-option>
          <mat-option [value]="'fullView'"><mat-icon>fullscreen</mat-icon></mat-option>
          <mat-option [value]="'side-view'"><mat-icon>view_sidebar</mat-icon></mat-option>
        </mat-select>
      </mat-form-field>
      @if (canBeClosed()) {
        <div class="mx-auto"></div>
        <button mat-icon-button (click)="closed.emit()"><mat-icon>close</mat-icon></button>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailMenuComponent {
  typeStoryView = { kanban: "capture", fullView: "fullscreen", "side-view": "view_sidebar" };
  inputStory = input.required<StoryDetail>();
  relativeDialog = inject(RelativeDialogService);
  notificationService = inject(NotificationService);
  storyDetailService = inject(StoryDetailService);
  workspaceService = inject(WorkspaceService);
  router = inject(Router);
  storyView = new FormControl<StoryView>("kanban", { nonNullable: true });
  kanbanWrapperService = inject(KanbanWrapperService);
  dialogRef = inject(MatDialog);
  canBeClosed = input(false);
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
    const story = this.inputStory();
    const dialogRef = this.relativeDialog.open(ChooseWorkflowDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "right",
      data: {
        currentWorkflowSlug: story?.workflow.slug,
      },
    });
    dialogRef.afterClosed().subscribe(async (newWorkflowSlug: string) => {
      if (newWorkflowSlug !== story?.workflow.slug) {
        const patchedStory = await this.storyDetailService.patchSelectedStory({ workflowSlug: newWorkflowSlug });
        if (patchedStory) {
          this.notificationService.success({ title: "notification.action.changes_saved" });
        }
      }
    });
  }
}
