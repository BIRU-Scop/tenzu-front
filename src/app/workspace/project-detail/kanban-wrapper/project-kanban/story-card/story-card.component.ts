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
import { UserNested } from "@tenzu/repository/user";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { ProjectKanbanService } from "../project-kanban.service";
import { MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { ProjectMembershipEntitiesStore } from "@tenzu/repository/project-membership";

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
    <mat-card appearance="outlined" *transloco="let t; prefix: 'workflow.detail_story'">
      <mat-card-header>
        <mat-card-title
          ><a [routerLink]="['../..', 'story', ref()]" class="line-clamp-2 w-fit"
            ><span class="text-on-tertiary-container">#{{ ref() }}</span> {{ title() }}</a
          ></mat-card-title
        >
      </mat-card-header>
      <mat-card-content>
        @if (users().length > 0) {
          <button (click)="openAssignStoryDialog($event)">
            <app-avatar-list [users]="users()" [prioritizeCurrentUser]="true" />
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
  title = input.required<string>();
  ref = input.required<number>();
  projectID = input.required<string>();
  users = input.required<UserNested[]>();

  // membershipStore = inject(MembershipStore);
  projectMembershipStore = inject(ProjectMembershipEntitiesStore);

  relativeDialog = inject(RelativeDialogService);
  projectKanbanService = inject(ProjectKanbanService);

  openAssignStoryDialog(event: MouseEvent): void {
    const teamMembers = this.projectMembershipStore.entities();
    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "auto",
      relativeYPosition: "auto",
      data: {
        assigned: this.users(),
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe(async (username) => {
      await this.projectKanbanService.assignStory(username, this.projectID(), this.ref());
    });
    dialogRef.componentInstance.memberUnassigned.subscribe(
      async (username) => await this.projectKanbanService.removeAssignStory(username, this.projectID(), this.ref()),
    );
  }
}
