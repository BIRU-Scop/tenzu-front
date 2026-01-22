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

import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { MatDivider } from "@angular/material/divider";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import {
  ProjectCreateDialog,
  ProjectCreateDialogData,
} from "@tenzu/shared/components/project-create-dialog/project-create-dialog";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-workspace-card",
  imports: [AvatarComponent, RouterLink, MatButton, TranslocoDirective, MatDivider, ButtonAddComponent],
  template: `
    @let _workspace = workspace();
    <ng-container *transloco="let t">
      <div class="flex flex-row items-center gap-2 mb-2">
        <app-avatar [name]="_workspace.name" [color]="_workspace.color" />
        @if (_workspace.userIsMember) {
          <a class="mat-title-medium" [routerLink]="['workspace', _workspace.id]">{{ _workspace.name }} </a>
        } @else {
          {{ _workspace.name }}
        }
        @if (_workspace.userCanCreateProjects) {
          <app-button-add
            class="ml-auto"
            [level]="'primary'"
            [translocoKey]="'commons.project'"
            (click)="openCreateProject(_workspace.id)"
          ></app-button-add>
        } @else if (_workspace.userIsInvited) {
          <button
            class="secondary-button"
            mat-flat-button
            type="button"
            [attr.aria-label]="'component.invitation.accept'"
            (click)="submitted.emit()"
          >
            {{ t("component.invitation.accept") }}
          </button>
          <button
            class="error-button"
            mat-flat-button
            type="button"
            [attr.aria-label]="'component.invitation.deny'"
            (click)="canceled.emit()"
          >
            {{ t("component.invitation.deny") }}
          </button>
        }
      </div>
      <mat-divider />
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
