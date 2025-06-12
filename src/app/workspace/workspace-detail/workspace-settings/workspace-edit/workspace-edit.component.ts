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

import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatInput, MatLabel } from "@angular/material/input";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { Router } from "@angular/router";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatError, MatFormField } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";

@Component({
  selector: "app-workspace-edit",
  imports: [
    AvatarComponent,
    ConfirmDirective,
    FormsModule,
    MatButton,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    TranslocoDirective,
    ReactiveFormsModule,
    HasPermissionDirective,
  ],
  template: `
    @let workspace = workspaceService.entityDetail();
    @if (workspace) {
      <div class="flex flex-col gap-y-8" *transloco="let t">
        <ng-container
          *appHasPermission="
            {
              actualEntity: workspace,
              requiredPermission: WorkspacePermissions.MODIFY_WORKSPACE,
            };
            else noModifyPermission
          "
        >
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-y-2">
            <div class="flex flex-row gap-4 items-center" *transloco="let t">
              <app-avatar size="xl" [name]="form.controls.name.value" [color]="workspace.color || 0"></app-avatar>
              <div class="flex flex-col gap-y-4">
                <mat-form-field>
                  <mat-label>{{ t("workspace.settings.edit.name") }}</mat-label>
                  <input
                    formControlName="name"
                    matInput
                    required
                    placeholder="name"
                    data-testid="workspace-name-input"
                  />
                  @if (form.controls.name.hasError("required")) {
                    <mat-error
                      data-testid="workspace-name-required-error"
                      [innerHTML]="t('workspace.settings.edit.name_required')"
                    ></mat-error>
                  }
                </mat-form-field>
              </div>
            </div>
            <div class="flex gap-x-4 mt-2">
              <button mat-flat-button type="submit" class="tertiary-button" data-testid="workspace-edit-submit">
                {{ t("commons.save") }}
              </button>
              <button mat-flat-button (click)="reset()" class="secondary-button">
                {{ t("commons.cancel") }}
              </button>
            </div>
          </form>
          <ng-container
            *appHasPermission="{
              actualEntity: workspace,
              requiredPermission: WorkspacePermissions.DELETE_WORKSPACE,
            }"
          >
            <div class="flex flex-col gap-y-2">
              <h2 class="mat-headline-small">{{ t("workspace.settings.edit.delete_workspace") }}</h2>
              <div class="flex flex-col gap-4">
                @if (workspace.totalProjects || 0 > 0) {
                  <div class="flex flex-row">
                    <mat-icon class="text-on-error pr-3 self-center">warning</mat-icon>
                    <p
                      class="mat-body-medium text-on-error-container align-middle"
                      [innerHTML]="
                        t('workspace.settings.edit.delete.error', { totalProjects: workspace.totalProjects })
                      "
                    ></p>
                  </div>
                }
                <button
                  [disabled]="workspace.totalProjects || 0 > 0"
                  mat-flat-button
                  class="error-button w-fit"
                  appConfirm
                  [data]="{ deleteAction: true }"
                  (popupConfirm)="onDelete()"
                >
                  {{ t("workspace.settings.edit.delete.delete") }}
                </button>
              </div>
            </div>
          </ng-container>
        </ng-container>
      </div>
      <ng-template #noModifyPermission>
        <div class="flex flex-row gap-4 items-center" *transloco="let t">
          <app-avatar size="xl" [name]="form.controls.name.value" [color]="workspace.color || 0"></app-avatar>
          {{ workspace.name }}
        </div>
      </ng-template>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceEditComponent {
  protected readonly WorkspacePermissions = WorkspacePermissions;

  workspaceService = inject(WorkspaceRepositoryService);

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
  });
  router = inject(Router);
  notificationService = inject(NotificationService);

  constructor() {
    effect(() => {
      this.reset();
    });
  }

  async onSubmit() {
    const workspace = this.workspaceService.entityDetail();
    if (workspace) {
      this.form.reset(this.form.value);
      if (this.form.valid) {
        await this.workspaceService.patchRequest(workspace.id, this.form.getRawValue(), { workspaceId: workspace.id });
      }
    }
  }

  async onDelete() {
    const workspace = this.workspaceService.entityDetail();
    if (!workspace) {
      return;
    }
    const deletedWorkspace = await this.workspaceService.deleteRequest(workspace, { workspaceId: workspace.id });
    if (deletedWorkspace) {
      await this.router.navigateByUrl("/");
      this.notificationService.error({
        translocoTitle: true,
        title: "workspace.settings.delete.deleted_workspace",
        translocoTitleParams: { var: deletedWorkspace.name },
      });
    }
  }

  reset() {
    const selectedEntity = this.workspaceService.entityDetail();
    if (selectedEntity) {
      this.form.reset({ ...selectedEntity });
    }
  }
}
