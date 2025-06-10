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
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { getAssignees, Story, StoryRepositoryService } from "@tenzu/repository/story";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-story-assignee",
  imports: [AvatarListComponent, MatIcon, MatIconButton, MatTooltip, TranslocoDirective],
  template: ` <ng-container *transloco="let t; prefix: 'workflow.detail_story'">
    @let _assignees = assignees();
    @if (_assignees.length > 0) {
      <button type="button" (click)="openAssignStoryDialog($event)" [attr.aria-label]="t('edit_assignees')">
        <app-avatar-list [users]="_assignees" [prioritizeCurrentUser]="true"></app-avatar-list>
      </button>
    } @else if (hasModifyPermission()) {
      <button
        mat-icon-button
        type="button"
        (click)="openAssignStoryDialog($event)"
        [attr.aria-label]="t('add_assignees')"
        [matTooltip]="t('add_assignees')"
      >
        <mat-icon>person_add</mat-icon>
      </button>
    } @else {
      <div class="w-min" [matTooltip]="t('no_assignee')">
        <button mat-icon-button type="button" disabled [attr.aria-label]="t('no_assignee')">
          <mat-icon>no_accounts</mat-icon>
        </button>
      </div>
    }
  </ng-container>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryAssigneeComponent {
  storyRepositoryService = inject(StoryRepositoryService);

  projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  relativeDialog = inject(RelativeDialogService);

  story = input.required<Pick<Story, "ref" | "title" | "projectId" | "assigneeIds">>();
  assignees = getAssignees(this.story);
  hasModifyPermission = input(false);
  config = input<{
    relativeXPosition?: "left" | "center" | "right" | "auto";
    relativeYPosition?: "above" | "below" | "auto";
  }>({
    relativeXPosition: "auto",
    relativeYPosition: "auto",
  });

  openAssignStoryDialog(event: MouseEvent): void {
    if (!this.hasModifyPermission()) {
      return;
    }
    const teamMembers = this.projectMembershipRepositoryService.members;
    const story = this.story();

    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      ...this.config(),
      data: {
        assignees: this.assignees,
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe(async (user) => {
      await this.storyRepositoryService.createAssign(user, { projectId: story.projectId, ref: story.ref });
    });
    dialogRef.componentInstance.memberUnassigned.subscribe(async (user) => {
      await this.storyRepositoryService.deleteAssign(user, { projectId: story.projectId, storyRef: story.ref });
    });
  }
}
