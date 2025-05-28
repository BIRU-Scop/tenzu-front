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

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { RouterLink } from "@angular/router";
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { getAssignees, Story, StoryRepositoryService } from "@tenzu/repository/story";

@Component({
  selector: "app-story-card",
  imports: [
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardContent,
    AvatarListComponent,
    MatCardTitle,
    TranslocoDirective,
    MatIcon,
    MatIconButton,
  ],
  template: `
    @let _story = story();
    <mat-card appearance="outlined" *transloco="let t; prefix: 'workflow.detail_story'">
      <mat-card-header>
        <mat-card-title
          ><a [routerLink]="['../..', 'story', _story.ref]" class="line-clamp-2 w-fit"
            ><span class="text-on-tertiary-container">#{{ _story.ref }}</span> {{ _story.title }}</a
          ></mat-card-title
        >
      </mat-card-header>
      <mat-card-content>
        @let _assignees = assignees();
        @if (_assignees.length > 0) {
          <button (click)="openAssignStoryDialog($event)">
            <app-avatar-list [users]="_assignees" [prioritizeCurrentUser]="true" />
          </button>
        } @else {
          <button
            mat-icon-button
            type="button"
            (click)="openAssignStoryDialog($event)"
            [attr.aria-label]="t('add_assignees')"
          >
            <mat-icon>person_add</mat-icon>
          </button>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardComponent {
  story = input.required<Pick<Story, "ref" | "title" | "projectId" | "assigneeIds">>();

  assignees = getAssignees(this.story);
  projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  storyRepositoryService = inject(StoryRepositoryService);
  relativeDialog = inject(RelativeDialogService);

  openAssignStoryDialog(event: MouseEvent): void {
    const story = this.story();
    const teamMembers = this.projectMembershipRepositoryService.members;
    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "auto",
      relativeYPosition: "auto",
      data: {
        assignees: this.assignees,
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe(async (user) => {
      await this.storyRepositoryService.createAssign(user, { projectId: story.projectId, ref: story.ref });
    });
    dialogRef.componentInstance.memberUnassigned.subscribe(
      async (user) =>
        await this.storyRepositoryService.deleteAssign(user, { projectId: story.projectId, storyRef: story.ref }),
    );
  }
}
