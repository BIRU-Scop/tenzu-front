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

import { Component, inject, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { MatDivider } from "@angular/material/divider";
import {
  ProjectCreateDialog,
  ProjectCreateDialogData,
} from "@tenzu/shared/components/project-create-dialog/project-create-dialog";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { MatDialog } from "@angular/material/dialog";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { ButtonMoreComponent } from "@tenzu/shared/components/ui/button/button-more.component";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-workspace-card",
  imports: [
    AvatarComponent,
    RouterLink,
    TranslocoDirective,
    MatDivider,
    ButtonComponent,
    ButtonMoreComponent,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
  ],
  template: `
    @let _workspace = workspace();
    <ng-container *transloco="let t">
      <div class="flex flex-row items-center gap-2 mb-2">
        <app-avatar [name]="_workspace.name" [color]="_workspace.color" mode="filled-square" />
        @if (_workspace.userIsMember) {
          <a class="mat-title-medium" [routerLink]="['workspace', _workspace.id]">{{ _workspace.name }} </a>
        } @else {
          {{ _workspace.name }}
        }
        @if (_workspace.userCanCreateProjects) {
          <app-button-more class="ml-auto" [matMenuTriggerFor]="workspaceMenu" />
          <mat-menu #workspaceMenu="matMenu">
            <button mat-menu-item (click)="openCreateProject(_workspace.id)">
              <mat-icon>add</mat-icon>
              {{ t("commons.project") }}
            </button>
          </mat-menu>
        } @else if (_workspace.userIsInvited) {
          <app-button
            class="ml-auto"
            translocoKey="component.invitation.accept"
            [level]="'primary'"
            iconName="check"
            (click)="submitted.emit()"
          />
          <app-button
            [level]="'error'"
            translocoKey="component.invitation.deny"
            [iconName]="'block'"
            (click)="canceled.emit()"
          />
        }
      </div>
      <mat-divider />
    </ng-container>
  `,
  styles: ``,
})
export class WorkspaceCardComponent {
  readonly dialog = inject(MatDialog);

  workspace = input.required<WorkspaceSummary>();

  submitted = output<void>();
  canceled = output<void>();

  openCreateProject(workspaceId: string): void {
    const data: ProjectCreateDialogData = {
      workspaceId,
    };
    this.dialog.open(ProjectCreateDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }
}
