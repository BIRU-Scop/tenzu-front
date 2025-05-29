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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatList } from "@angular/material/list";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { MatTableModule } from "@angular/material/table";

@Component({
  selector: "app-workspace-members",
  imports: [TranslocoDirective, MatList, UserCardComponent, MatTableModule],
  template: `
    <ng-container *transloco="let t">
      <p class="mat-body-medium text-on-surface mb-2">{{ t("workspace.members.members_description") }}</p>
      @let workspaceMembershipEntities = workspaceMembershipRepositoryService.entities();
      @if (workspaceMembershipEntities.length > 0) {
        <mat-list>
          @for (member of workspaceMembershipEntities; track member.user.id) {
            <app-user-card
              [fullName]="member.user.fullName"
              [username]="member.user.username"
              [color]="member.user.color"
            ></app-user-card>
          }
        </mat-list>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceMembersComponent {
  workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
}
