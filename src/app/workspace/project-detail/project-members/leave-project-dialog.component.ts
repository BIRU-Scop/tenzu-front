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

import { ChangeDetectionStrategy, Component, computed, inject, Signal } from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatFormField, MatLabel, MatSelect } from "@angular/material/select";
import { ProjectMembership, ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { MatIcon } from "@angular/material/icon";

type DeleteMembershipDialogData = {
  membership: Signal<ProjectMembership>;
};

@Component({
  selector: "app-leave-project-dialog",
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    TranslocoDirective,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatIcon,
    MatLabel,
    MatFormField,
  ],
  template: `
    <ng-container *transloco="let t">
      <h2 id="aria-label" mat-dialog-title>
        {{ t("project.members.delete.leave_title", { name: projectRepositoryService.entityDetail()?.name }) }}
      </h2>
      <mat-dialog-content>
        @if (isLastMembership()) {
          <h3 class="mat-title-small mb-2 flex flex-row items-center">
            <mat-icon class="text-on-error mr-3">warning</mat-icon>
            <p class="text-on-error">{{ t("project.members.delete.project_will_be_deleted") }}</p>
          </h3>
        } @else if (isUniqueOwner()) {
          <h3 class="mat-title-small mb-2 flex flex-row items-center">
            <mat-icon class="text-on-error mr-3">warning</mat-icon>
            <p class="text-on-error">{{ t("project.members.delete.sole_owner_succession") }}</p>
          </h3>
          <form class="flex flex-col gap-y-4" [formGroup]="form">
            <mat-form-field>
              <mat-label>{{ t("project.members.delete.successor_label") }}</mat-label>
              <mat-select formControlName="successorId">
                @for (ms of filteredMemberships(); track ms.id) {
                  <mat-option value="{{ ms.user.id }}">
                    {{ ms.user.fullName }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </form>
        }
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-flat-button mat-dialog-close class="secondary-button">
          {{ t("directives.confirm_popup_component.cancelAction") }}
        </button>
        <button mat-flat-button (click)="submit()" class="error-button" [disabled]="isUniqueOwner() && form.invalid">
          {{ t("directives.confirm_popup_component.confirmAction") }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveProjectDialogComponent {
  data = inject<DeleteMembershipDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<LeaveProjectDialogComponent>);
  fb = inject(FormBuilder);
  readonly projectMembershipService = inject(ProjectMembershipRepositoryService);
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);

  form = this.fb.group({
    successorId: [undefined, Validators.required],
  });

  filteredMemberships = computed(() => {
    return this.projectMembershipService.entities().filter((membership) => membership.id !== this.data.membership().id);
  });
  isLastMembership = computed(() => {
    return this.filteredMemberships().length === 0;
  });
  isUniqueOwner = computed(() => {
    const ownerRole = this.projectRoleRepositoryService.ownerRole();
    return (
      !this.isLastMembership() &&
      ownerRole &&
      this.data.membership().roleId == ownerRole.id &&
      !this.filteredMemberships().find((membership) => membership.roleId === ownerRole.id)
    );
  });

  submit() {
    this.dialogRef.close({ ...this.form.value, membership: this.data.membership(), delete: this.isLastMembership() });
  }
}
