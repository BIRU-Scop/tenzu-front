/*
 * Copyright (C) 2024-2026 BIRU
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

import { ChangeDetectionStrategy, Component, inject, input, output, signal } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { MatIconAnchor, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { StoryDetail } from "@tenzu/repository/story";
import { Router, RouterLink } from "@angular/router";
import { ChooseWorkflowDialogComponent } from "./choose-workflow-dialog/choose-workflow-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { StoryDetailFacade } from "../story-detail.facade";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { StoryView } from "../../kanban-wrapper.store";
import { KanbanWrapperService } from "../../kanban-wrapper.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";

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
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
  template: `
    @let _story = story();
    @if (_story) {
      <div class="flex flex-row p-4 justify-between">
        <div class="flex flex-row gap-1  place-items-center" *transloco="let t">
          <span class="text-on-surface-variant mat-title-small">{{ t("workflow.detail_story.workflow") }}</span>
          <span class="text-on-surface mat-title-medium">{{ _story.workflow.name }}</span>
          @if (hasModifyPermission()) {
            <button
              mat-icon-button
              class="icon-sm"
              type="button"
              [attr.aria-label]="t('workflow.detail_story.change_workflow')"
              (click)="openChooseWorkflowDialog($event)"
              [matTooltip]="t('workflow.detail_story.change_workflow')"
            >
              <mat-icon>edit</mat-icon>
            </button>
          }
          <span class="text-on-surface-variant mat-title-small">/</span>
          <span class="text-on-surface-variant mat-title-small">{{ t("workflow.detail_story.story") }}</span>
          <span class="text-on-surface mat-title-medium">#{{ _story.ref }}</span>
          <a
            mat-icon-button
            class="icon-sm"
            type="button"
            [attr.aria-label]="t('workflow.detail_story.story_previous')"
            [matTooltip]="t('workflow.detail_story.story_previous')"
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
            [attr.aria-label]="t('workflow.detail_story.story_next')"
            [matTooltip]="t('workflow.detail_story.story_next')"
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
          <button
            mat-icon-button
            type="button"
            [matMenuTriggerFor]="storyViewMenu"
            [attr.aria-label]="t('workflow.change_mode_view.aria_label')"
            [matTooltip]="t('workflow.change_mode_view.aria_label')"
          >
            <mat-icon>{{ typeStoryView[storyViewModel()] }}</mat-icon>
          </button>

          <mat-menu #storyViewMenu="matMenu">
            <button mat-menu-item type="button" (click)="setStoryView('kanban')">
              <mat-icon>capture</mat-icon>
              <span>{{ t("workflow.change_mode_view.kanban") }}</span>
            </button>

            <button mat-menu-item type="button" (click)="setStoryView('fullView')">
              <mat-icon>fullscreen</mat-icon>
              <span>{{ t("workflow.change_mode_view.full_view") }}</span>
            </button>

            <button mat-menu-item type="button" (click)="setStoryView('side-view')">
              <mat-icon>view_sidebar</mat-icon>
              <span>{{ t("workflow.change_mode_view.side_view") }}</span>
            </button>
          </mat-menu>
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
  storyDetailFacade = inject(StoryDetailFacade);
  workspaceService = inject(WorkspaceRepositoryService);
  router = inject(Router);
  kanbanWrapperService = inject(KanbanWrapperService);
  dialogRef = inject(MatDialog);

  storyViewModel = signal<StoryView>("kanban");

  canBeClosed = input(false);
  hasModifyPermission = input(false);
  story = input.required<StoryDetail>();

  closed = output<void>();

  constructor() {
    toObservable(this.kanbanWrapperService.storyView).subscribe((storyView) => {
      this.storyViewModel.set(storyView);
      if (storyView !== "kanban") {
        this.dialogRef.closeAll();
      }
    });
  }
  protected setStoryView(storyView: StoryView) {
    this.storyViewModel.set(storyView);
    this.kanbanWrapperService.setStoryView(storyView);
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
        const patchedStory = await this.storyDetailFacade.changeWorkflowSelectedStory({
          workflowId: newWorkflowId,
        });
        if (patchedStory) {
          this.notificationService.success({ title: "notification.action.changes_saved" });
        }
      }
    });
  }
}
