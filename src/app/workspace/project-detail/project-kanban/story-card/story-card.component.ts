/*
 * Copyright (C) 2024 BIRU
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
import { UserMinimal } from "@tenzu/data/user";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { RelativeDialogService } from "@tenzu/utils/services";
import { MembershipStore } from "@tenzu/data/membership";
import { ProjectKanbanService } from "../project-kanban.service";
import { MatButton, MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-story-card",
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardContent,
    AvatarListComponent,
    MatCardTitle,
    MatButton,
    TranslocoDirective,
    AvatarComponent,
    MatIcon,
    MatIconButton,
  ],
  template: `
    <mat-card appearance="outlined" *transloco="let t; prefix: 'workflow.detail_story'">
      <mat-card-header>
        <mat-card-title
          ><a [routerLink]="['../..', 'story', ref()]" class="line-clamp-2 w-fit"
            ><span class="text-tertiary-30">#{{ ref() }}</span> {{ title() }}</a
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
  users = input.required<UserMinimal[]>();

  membershipStore = inject(MembershipStore);

  relativeDialog = inject(RelativeDialogService);
  projectKanbanService = inject(ProjectKanbanService);

  openAssignStoryDialog(event: MouseEvent): void {
    const teamMembers = this.membershipStore.projectEntities();
    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "auto",
      relativeYPosition: "auto",
      data: {
        assigned: this.users(),
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe(
      async (username) => await this.projectKanbanService.assignStory(username, null, this.ref()),
    );
    dialogRef.componentInstance.memberUnassigned.subscribe(
      async (username) => await this.projectKanbanService.removeAssignStory(username, null, this.ref()),
    );
  }
}
