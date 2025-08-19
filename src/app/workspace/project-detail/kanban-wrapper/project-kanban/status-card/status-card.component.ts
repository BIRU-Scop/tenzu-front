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
import { MatCard, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  EnterNameDialogComponent,
  NameDialogData,
} from "@tenzu/shared/components/enter-name-dialog/enter-name-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { ProjectKanbanService } from "../project-kanban.service";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatDialog } from "@angular/material/dialog";
import { DeleteStatusDialogComponent } from "./delete-status-dialog/delete-status-dialog.component";
import { Validators } from "@angular/forms";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { StatusSummary } from "@tenzu/repository/status";
import { ProjectDetail } from "@tenzu/repository/project";

@Component({
  selector: "app-status-card",
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    TranslocoDirective,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    HasPermissionDirective,
  ],
  template: `
    <mat-card appearance="outlined" class="heading-card" *transloco="let t; prefix: 'workflow'">
      <mat-card-header>
        <mat-card-title class="whitespace-nowrap truncate">
          {{ name() }}
        </mat-card-title>

        <ng-container
          *appHasPermission="{
            actualEntity: project(),
            requiredPermission: ProjectPermissions.MODIFY_WORKFLOW,
          }"
        >
          <button mat-icon-button [attr.aria-label]="t('edit_status.aria_label')" [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            @if (config().showLeft) {
              <button mat-menu-item (click)="moveLeft()">
                <mat-icon>arrow_back</mat-icon>
                {{ t("edit_status.move_left") }}
              </button>
            }
            @if (config().showRight) {
              <button mat-menu-item (click)="moveRight()">
                <mat-icon>arrow_forward</mat-icon>
                {{ t("edit_status.move_right") }}
              </button>
            }
            <button mat-menu-item (click)="openEditStatus($event)">
              <mat-icon>edit</mat-icon>{{ t("edit_status.edit_name") }}
            </button>
            <button mat-menu-item (click)="onDelete()"><mat-icon>delete</mat-icon>{{ t("edit_status.delete") }}</button>
          </mat-menu>
        </ng-container>
      </mat-card-header>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full",
  },
})
export class StatusCardComponent {
  protected readonly ProjectPermissions = ProjectPermissions;

  name = input.required<StatusSummary["name"]>();
  id = input.required<StatusSummary["id"]>();
  project = input.required<ProjectDetail>();
  isEmpty = input(false);
  config = input<{ showLeft: boolean; showRight: boolean }>({ showLeft: true, showRight: true });
  movedRight = output<boolean>();
  movedLeft = output<boolean>();
  projectKanbanService = inject(ProjectKanbanService);
  dialog = inject(MatDialog);
  relativeDialog = inject(RelativeDialogService);

  openEditStatus(event: MouseEvent): void {
    const data: NameDialogData = {
      label: "workflow.edit_status_name.status_name",
      action: "workflow.edit_status_name.edit_status_name",
      defaultValue: this.name(),
      validators: [
        {
          type: "required",
          message: "workflow.edit_status_name.name_required",
          validatorFn: Validators.required,
        },
        {
          type: "maxLength",
          message: "form_errors.max_length",
          translocoParams: { length: 30 },
          validatorFn: Validators.maxLength(30),
        },
      ],
    };
    const dialogRef = this.relativeDialog.open(EnterNameDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "auto",
      data: data,
    });
    dialogRef.afterClosed().subscribe(async (name?: string) => {
      if (name) {
        await this.projectKanbanService.editStatus({ name, id: this.id() });
      }
    });
  }

  async onDelete() {
    if (this.isEmpty()) {
      await this.projectKanbanService.deleteStatus(this.id());
    } else {
      this.openDeleteDialog();
    }
  }
  moveLeft() {
    this.movedLeft.emit(true);
  }
  moveRight() {
    this.movedRight.emit(true);
  }
  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteStatusDialogComponent, {
      ...matDialogConfig,
      data: {
        statusName: this.name(),
        statusId: this.id(),
      },
    });
    dialogRef.afterClosed().subscribe(async (formValue?: { stories: "delete" | "move"; status: string }) => {
      if (formValue) {
        const moveToStatus: string | undefined = formValue.stories === "move" ? formValue.status : undefined;
        await this.projectKanbanService.deleteStatus(this.id(), moveToStatus);
      }
    });
  }
}
