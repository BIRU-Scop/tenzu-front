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
import { getAssignees, StoryDetail, StoryRepositoryService } from "@tenzu/repository/story";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-story-assignee",
  imports: [AvatarListComponent, MatIcon, MatIconButton, MatTooltip, TranslocoDirective],
  template: ` <div class="flex flex-row gap-4" *transloco="let t; prefix: 'workflow.detail_story'">
    <span class="text-on-surface-variant mat-label-medium self-center">{{ t("assigned_to") }}</span>
    @let _assignees = assignees();
    @if (_assignees.length > 0) {
      <button type="button" (click)="openAssignStoryDialog($event)" [attr.aria-label]="t('edit_assignees')">
        <app-avatar-list [users]="_assignees" [prioritizeCurrentUser]="true"></app-avatar-list>
      </button>
    } @else {
      <button
        mat-icon-button
        type="button"
        (click)="openAssignStoryDialog($event)"
        [attr.aria-label]="t('add_assignees')"
        [matTooltip]="t('add_assignees')"
      >
        <mat-icon>person_add</mat-icon>
      </button>
    }
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryAssigneeComponent {
  storyDetail = input.required<StoryDetail>();
  storyRepositoryService = inject(StoryRepositoryService);

  projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  relativeDialog = inject(RelativeDialogService);
  assignees = getAssignees(this.storyDetail);

  openAssignStoryDialog(event: MouseEvent): void {
    const teamMembers = this.projectMembershipRepositoryService.members;
    const storyDetail = this.storyDetail();

    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "left",
      data: {
        assignees: this.assignees,
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe(async (user) => {
      await this.storyRepositoryService.createAssign(user, { projectId: storyDetail.projectId, ref: storyDetail.ref });
    });
    dialogRef.componentInstance.memberUnassigned.subscribe(async (user) => {
      await this.storyRepositoryService.deleteAssign(user, {
        projectId: storyDetail.projectId,
        storyRef: storyDetail.ref,
      });
    });
  }
}
