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

import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { ProjectRoleRepositoryService, ProjectRoleSummary } from "@tenzu/repository/project-roles";
import { TypedDialog } from "@tenzu/utils/services/typed-dialog-service/typed-dialog.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatButton } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProjectDetail } from "@tenzu/repository/project";

@Component({
  selector: "app-delete-role-dialog",
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
  ],
  template: ` <ng-container *transloco="let t">
    <div id="aria-label" mat-dialog-title>
      {{ t("project.settings.permissions.delete_role_dialog.title") }}
    </div>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="mt-4">
          <mat-label>{{ t("project.settings.permissions.delete_role_dialog.project_role_select_title") }}</mat-label>
          <mat-select [formControlName]="'moveToProjectRole'">
            @for (projectRole of projectRoleEntitiesSummaryAvailable(); track projectRole.id) {
              <mat-option [value]="projectRole">{{ projectRole.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-flat-button mat-dialog-close class="secondary-button">
        {{ t("project.settings.permissions.delete_role_dialog.cancel") }}
      </button>
      <button [disabled]="form.invalid" mat-flat-button (click)="submit()" class="error-button">
        {{ t("project.settings.permissions.delete_role_dialog.confirm") }}
      </button>
    </mat-dialog-actions>
  </ng-container>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteRoleDialogComponent extends TypedDialog<
  { projectRoleSummary: ProjectRoleSummary; projectDetail: ProjectDetail },
  ProjectRoleSummary
> {
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  readonly projectRoleEntitiesSummaryAvailable = computed(() => {
    const projectRoleEntitiesSummary = this.projectRoleRepositoryService.entitiesSummary();
    const projectRoleToDelete = this.data.projectRoleSummary;
    const projectDetail = this.data.projectDetail;
    return projectRoleEntitiesSummary.filter((item) => {
      return item.id != projectRoleToDelete.id && (!item.isOwner || !!projectDetail.userRole?.isOwner);
    });
  });
  readonly fb = inject(FormBuilder);
  form = this.fb.group({
    moveToProjectRole: [null as ProjectRoleSummary | null, [Validators.required]],
  });

  submit(): void {
    const projectRole = this.form.controls.moveToProjectRole.value;
    if (this.form.valid && projectRole) {
      this.dialogRef.close(projectRole);
    }
  }
}
